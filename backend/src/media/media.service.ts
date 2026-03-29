import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model, Types } from 'mongoose';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { EtablissementService } from '../etablissement-services/schemas/etablissement-service.schema';
import { Pays } from '../pays/schemas/pays.schema';
import { UploadsService } from '../uploads/uploads.service';
import { Ville } from '../villes/schemas/ville.schema';
import { ListMediaQueryDto } from './dto/list-media-query.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Media, MediaKind } from './schemas/media.schema';

function detectMediaKind(mimetype: string): MediaKind | null {
  if (mimetype.startsWith('image/')) {
    return 'image';
  }
  if (mimetype.startsWith('video/')) {
    return 'video';
  }
  return null;
}

/**
 * Filtre Mongo pour « même entité parente » qu’un document média.
 * Sert à désigner tous les médias dont il faut baisser `isPrimary` avant d’en promouvoir une.
 */
function primaryScopeFilter(doc: Media): Record<string, unknown> | null {
  const etab =
    doc.etablissementId ??
    (doc.entityType === 'etablissement' ? doc.entityId : undefined);
  const svc =
    doc.etablissementServiceId ??
    (doc.entityType === 'service' ? doc.entityId : undefined);

  if (etab) {
    return {
      $or: [
        { etablissementId: etab },
        { entityType: 'etablissement', entityId: etab },
      ],
    };
  }
  if (svc) {
    return {
      $or: [
        { etablissementServiceId: svc },
        { entityType: 'service', entityId: svc },
      ],
    };
  }
  if (doc.entityType === 'city' && doc.entityId) {
    return { entityType: 'city', entityId: doc.entityId };
  }
  if (doc.entityType === 'country' && doc.entityId) {
    return { entityType: 'country', entityId: doc.entityId };
  }
  return null;
}

/** Parent cible après validation du DTO (un seul mode actif). */
type ResolvedUploadParent =
  | { kind: 'etablissement'; etablissementId: Types.ObjectId }
  | { kind: 'service'; etablissementServiceId: Types.ObjectId }
  | { kind: 'city'; entityId: Types.ObjectId }
  | { kind: 'country'; entityId: Types.ObjectId };

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(EtablissementService.name)
    private readonly etablissementServiceModel: Model<EtablissementService>,
    @InjectModel(Pays.name) private readonly paysModel: Model<Pays>,
    @InjectModel(Ville.name) private readonly villeModel: Model<Ville>,
    private readonly uploads: UploadsService,
    private readonly config: ConfigService,
  ) {}

  private buildPublicUrl(bucket: string, objectKey: string): string {
    const base = this.config
      .getOrThrow<string>('minio.publicUrl')
      .replace(/\/$/, '');
    const path = objectKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return `${base}/${bucket}/${path}`;
  }

  private async assertCountryExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant pays invalide');
    }
    const exists = await this.paysModel.exists({ _id: id }).exec();
    if (!exists) {
      throw new NotFoundException('Pays introuvable');
    }
  }

  private async assertCityExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant ville invalide');
    }
    const exists = await this.villeModel.exists({ _id: id }).exec();
    if (!exists) {
      throw new NotFoundException('Ville introuvable');
    }
  }

  /** Envoie vers MinIO et calcule l’URL publique (tous types de parent). */
  private async storeFileInMinio(
    file: Express.Multer.File,
    prestataireId: string,
  ): Promise<{
    url: string;
    bucket: string;
    objectKey: string;
    size: number;
  }> {
    const safe = file.originalname.replace(/[^\w.-]+/g, '_') || 'file';
    const objectKey = `media/${prestataireId}/${randomUUID()}-${safe}`;
    const uploaded = await this.uploads.uploadFileWithKey(file, objectKey);
    return {
      url: this.buildPublicUrl(uploaded.bucket, uploaded.key),
      bucket: uploaded.bucket,
      objectKey: uploaded.key,
      size: uploaded.size,
    };
  }

  /**
   * Liste publique des médias liés à un établissement (vérifie que l’établissement existe).
   */
  async findMediaForEtablissement(etablissementId: string) {
    if (!Types.ObjectId.isValid(etablissementId)) {
      throw new BadRequestException('Identifiant établissement invalide');
    }
    const etab = await this.etablissementModel.findById(etablissementId).exec();
    if (!etab) {
      throw new NotFoundException('Établissement introuvable');
    }
    const id = new Types.ObjectId(etablissementId);
    return this.mediaModel
      .find({
        $or: [{ etablissementId: id }, { entityType: 'etablissement', entityId: id }],
      })
      .sort({ isPrimary: -1, createdAt: -1 })
      .exec();
  }

  /**
   * Liste publique des médias liés à une ligne établissement ↔ service (vérifie que la ligne existe).
   */
  async findMediaForEtablissementService(etablissementServiceId: string) {
    await this.loadEtablissementServiceRow(etablissementServiceId);
    const id = new Types.ObjectId(etablissementServiceId);
    return this.mediaModel
      .find({
        $or: [
          { etablissementServiceId: id },
          { entityType: 'service', entityId: id },
        ],
      })
      .sort({ isPrimary: -1, createdAt: -1 })
      .exec();
  }

  private mapPublicImageRows(rows: unknown[]) {
    type Row = {
      _id: Types.ObjectId;
      url: string;
      isPrimary: boolean;
      mimeType?: string;
      createdAt?: Date;
    };
    return (rows as Row[]).map((row) => ({
      id: String(row._id),
      url: row.url,
      isPrimary: row.isPrimary,
      mimeType: row.mimeType,
      createdAt: row.createdAt,
    }));
  }

  private mapPublicImageRow(row: unknown | null | undefined) {
    if (row == null) {
      return null;
    }
    return this.mapPublicImageRows([row])[0] ?? null;
  }

  /**
   * Image marquée principale pour un établissement (`isPrimary` + `type: image`), ou `null`.
   */
  async findPrimaryMediaForEtablissement(etablissementId: string) {
    if (!Types.ObjectId.isValid(etablissementId)) {
      throw new BadRequestException('Identifiant établissement invalide');
    }
    const etab = await this.etablissementModel.findById(etablissementId).exec();
    if (!etab) {
      throw new NotFoundException('Établissement introuvable');
    }
    const id = new Types.ObjectId(etablissementId);
    const row = await this.mediaModel
      .findOne({
        $or: [{ etablissementId: id }, { entityType: 'etablissement', entityId: id }],
        type: 'image',
        isPrimary: true,
      })
      .select('url isPrimary mimeType createdAt')
      .lean()
      .exec();
    return this.mapPublicImageRow(row);
  }

  /**
   * Image marquée principale pour une ville, ou `null`.
   */
  async findPrimaryMediaForCity(cityId: string) {
    await this.assertCityExists(cityId);
    const oid = new Types.ObjectId(cityId);
    const row = await this.mediaModel
      .findOne({
        entityType: 'city',
        entityId: oid,
        type: 'image',
        isPrimary: true,
      })
      .select('url isPrimary mimeType createdAt')
      .lean()
      .exec();
    return this.mapPublicImageRow(row);
  }

  /**
   * Image marquée principale pour un pays, ou `null`.
   */
  async findPrimaryMediaForCountry(countryId: string) {
    await this.assertCountryExists(countryId);
    const oid = new Types.ObjectId(countryId);
    const row = await this.mediaModel
      .findOne({
        entityType: 'country',
        entityId: oid,
        type: 'image',
        isPrimary: true,
      })
      .select('url isPrimary mimeType createdAt')
      .lean()
      .exec();
    return this.mapPublicImageRow(row);
  }

  /**
   * Images publiques liées à une ville (`entityType` + `entityId`).
   */
  async findMediaForCity(cityId: string) {
    await this.assertCityExists(cityId);
    const oid = new Types.ObjectId(cityId);
    const rows = await this.mediaModel
      .find({ entityType: 'city', entityId: oid, type: 'image' })
      .select('url isPrimary mimeType createdAt')
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean()
      .exec();
    return this.mapPublicImageRows(rows);
  }

  /**
   * Images publiques liées à un pays (`entityType` + `entityId`).
   */
  async findMediaForCountry(countryId: string) {
    await this.assertCountryExists(countryId);
    const oid = new Types.ObjectId(countryId);
    const rows = await this.mediaModel
      .find({ entityType: 'country', entityId: oid, type: 'image' })
      .select('url isPrimary mimeType createdAt')
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean()
      .exec();
    return this.mapPublicImageRows(rows);
  }

  /** Charge la ligne EtablissementService ou lève 400 / 404. */
  private async loadEtablissementServiceRow(
    etablissementServiceId: string,
  ): Promise<EtablissementService> {
    if (!Types.ObjectId.isValid(etablissementServiceId)) {
      throw new BadRequestException(
        'Identifiant établissement / service invalide',
      );
    }
    const row = await this.etablissementServiceModel
      .findById(etablissementServiceId)
      .exec();
    if (!row) {
      throw new NotFoundException('Ligne établissement / service introuvable');
    }
    return row;
  }

  private async assertPrestataireOwnsEtablissement(
    etablissementId: string,
    prestataireId: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(etablissementId)) {
      throw new BadRequestException('Identifiant établissement invalide');
    }
    const etab = await this.etablissementModel.findById(etablissementId).exec();
    if (!etab) {
      throw new NotFoundException('Établissement introuvable');
    }
    if (etab.prestataire.toString() !== prestataireId) {
      throw new ForbiddenException(
        "Vous n'êtes pas propriétaire de cet établissement",
      );
    }
  }

  private async assertPrestataireOwnsEtablissementService(
    etablissementServiceId: string,
    prestataireId: string,
  ): Promise<void> {
    const row = await this.loadEtablissementServiceRow(etablissementServiceId);
    const etab = await this.etablissementModel
      .findById(row.etablissement)
      .exec();
    if (!etab) {
      throw new NotFoundException('Établissement introuvable');
    }
    if (etab.prestataire.toString() !== prestataireId) {
      throw new ForbiddenException(
        "Vous n'êtes pas propriétaire de cet établissement (ligne service)",
      );
    }
  }

  /**
   * Accès prestataire : le média doit être lié à un établissement ou une ligne service
   * dont le propriétaire (Etablissement.prestataire) est l’utilisateur courant.
   */
  private async assertPrestataireOwnsMediaLinkedResource(
    doc: Media,
    prestataireId: string,
  ): Promise<void> {
    const etabId =
      doc.etablissementId ??
      (doc.entityType === 'etablissement' ? doc.entityId : undefined);
    const esId =
      doc.etablissementServiceId ??
      (doc.entityType === 'service' ? doc.entityId : undefined);

    if (etabId) {
      await this.assertPrestataireOwnsEtablissement(
        String(etabId),
        prestataireId,
      );
      return;
    }
    if (esId) {
      await this.assertPrestataireOwnsEtablissementService(
        String(esId),
        prestataireId,
      );
      return;
    }
    if (doc.entityType === 'city' || doc.entityType === 'country') {
      if (doc.prestataire.toString() === prestataireId) {
        return;
      }
      throw new ForbiddenException(
        "Vous n'êtes pas l'auteur de ce média (ville / pays).",
      );
    }
    throw new ForbiddenException(
      'Ce média n’est rattaché à aucune ressource que vous gérez',
    );
  }

  /** Un seul `isPrimary: true` par entité parente (voir `primaryScopeFilter`). */
  private async clearPrimarySameScope(doc: Media): Promise<void> {
    const scope = primaryScopeFilter(doc);
    if (!scope) {
      return;
    }
    await this.mediaModel
      .updateMany(
        { $and: [scope, { isPrimary: true }] },
        { $set: { isPrimary: false } },
      )
      .exec();
  }

  /**
   * Marque ce document comme image principale : met les autres du même scope à `false`.
   */
  private async applyPrimaryToMedia(doc: Media): Promise<Media> {
    if (doc.type !== 'image') {
      throw new BadRequestException('Seule une image peut être principale');
    }
    const scope = primaryScopeFilter(doc);
    if (!scope) {
      throw new BadRequestException(
        'Média sans entité parente reconnue pour une image principale',
      );
    }
    await this.clearPrimarySameScope(doc);
    const rawId = (doc as { _id?: Types.ObjectId; id?: string })._id ?? (doc as { id?: string }).id;
    const id = new Types.ObjectId(String(rawId));
    await this.mediaModel
      .updateOne({ _id: id }, { $set: { isPrimary: true } })
      .exec();
    const updated = await this.mediaModel.findById(id).exec();
    if (!updated) {
      throw new NotFoundException('Média introuvable');
    }
    return updated;
  }

  private validateUploadParentDto(dto: UploadMediaDto): void {
    const hasEtab = Boolean(dto.etablissementId);
    const hasEs = Boolean(dto.etablissementServiceId);
    const geo =
      dto.entityType === 'city' || dto.entityType === 'country'
        ? dto.entityType
        : null;

    if (geo) {
      if (hasEtab || hasEs) {
        throw new BadRequestException(
          'Ne pas combiner entityType (city/country) avec etablissementId ou etablissementServiceId.',
        );
      }
      if (!dto.entityId) {
        throw new BadRequestException(
          'entityId est requis avec entityType city ou country.',
        );
      }
      return;
    }

    if (dto.entityId) {
      throw new BadRequestException(
        'entityId requiert entityType = city ou country.',
      );
    }

    if (hasEtab === hasEs) {
      throw new BadRequestException(
        'Indiquez exactement un des deux : etablissementId OU etablissementServiceId.',
      );
    }
  }

  private resolveUploadParent(dto: UploadMediaDto): ResolvedUploadParent {
    if (dto.entityType === 'country' && dto.entityId) {
      return { kind: 'country', entityId: new Types.ObjectId(dto.entityId) };
    }
    if (dto.entityType === 'city' && dto.entityId) {
      return { kind: 'city', entityId: new Types.ObjectId(dto.entityId) };
    }
    if (dto.etablissementId) {
      return {
        kind: 'etablissement',
        etablissementId: new Types.ObjectId(dto.etablissementId),
      };
    }
    return {
      kind: 'service',
      etablissementServiceId: new Types.ObjectId(dto.etablissementServiceId!),
    };
  }

  private async assertPrestataireOwnsUploadTarget(
    dto: UploadMediaDto,
    prestataireId: string,
  ): Promise<void> {
    if (dto.entityType === 'country' && dto.entityId) {
      await this.assertCountryExists(dto.entityId);
      return;
    }
    if (dto.entityType === 'city' && dto.entityId) {
      await this.assertCityExists(dto.entityId);
      return;
    }
    if (dto.etablissementId) {
      await this.assertPrestataireOwnsEtablissement(
        dto.etablissementId,
        prestataireId,
      );
    } else if (dto.etablissementServiceId) {
      await this.assertPrestataireOwnsEtablissementService(
        dto.etablissementServiceId,
        prestataireId,
      );
    }
  }

  private async createMediaRecord(
    file: Express.Multer.File,
    parent: ResolvedUploadParent,
    prestataireId: string,
    kind: MediaKind,
  ): Promise<Media> {
    const stored = await this.storeFileInMinio(file, prestataireId);
    const prestataireOid = new Types.ObjectId(prestataireId);
    const base = {
      url: stored.url,
      bucket: stored.bucket,
      objectKey: stored.objectKey,
      type: kind,
      mimeType: file.mimetype,
      sizeBytes: stored.size,
      originalFilename: file.originalname,
      prestataire: prestataireOid,
      isPrimary: false,
    };

    if (parent.kind === 'etablissement') {
      return this.mediaModel.create({
        ...base,
        etablissementId: parent.etablissementId,
        entityType: 'etablissement' as const,
        entityId: parent.etablissementId,
      });
    }
    if (parent.kind === 'service') {
      return this.mediaModel.create({
        ...base,
        etablissementServiceId: parent.etablissementServiceId,
        entityType: 'service' as const,
        entityId: parent.etablissementServiceId,
      });
    }
    return this.mediaModel.create({
      ...base,
      entityType: parent.kind,
      entityId: parent.entityId,
    });
  }

  async upload(
    file: Express.Multer.File | undefined,
    dto: UploadMediaDto,
    prestataireId: string,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Fichier manquant (champ "file").');
    }

    this.validateUploadParentDto(dto);
    await this.assertPrestataireOwnsUploadTarget(dto, prestataireId);
    const uploadParent = this.resolveUploadParent(dto);

    const kind = detectMediaKind(file.mimetype || '');
    if (!kind) {
      throw new BadRequestException(
        'Type de fichier non supporté (images et vidéos uniquement).',
      );
    }
    if (dto.isPrimary && kind !== 'image') {
      throw new BadRequestException('isPrimary ne s’applique qu’aux images');
    }

    const created = await this.createMediaRecord(
      file,
      uploadParent,
      prestataireId,
      kind,
    );
    if (dto.isPrimary) {
      return this.applyPrimaryToMedia(created);
    }
    return created;
  }

  /** Plusieurs fichiers, même parent ; `isPrimary` → première image du lot devient principale. */
  async uploadBatch(
    files: Express.Multer.File[] | undefined,
    dto: UploadMediaDto,
    prestataireId: string,
  ) {
    if (!files?.length) {
      throw new BadRequestException('Au moins un fichier (champ "files").');
    }

    this.validateUploadParentDto(dto);
    await this.assertPrestataireOwnsUploadTarget(dto, prestataireId);
    const uploadParent = this.resolveUploadParent(dto);

    const results: Media[] = [];
    let primaryAssigned = false;

    for (const file of files) {
      if (!file?.buffer) {
        throw new BadRequestException('Fichier vide ou manquant dans le lot');
      }
      const kind = detectMediaKind(file.mimetype || '');
      if (!kind) {
        throw new BadRequestException(
          `Type non supporté : ${file.originalname}`,
        );
      }

      const wantPrimary =
        Boolean(dto.isPrimary) && !primaryAssigned && kind === 'image';
      const created = await this.createMediaRecord(
        file,
        uploadParent,
        prestataireId,
        kind,
      );

      if (wantPrimary) {
        results.push(await this.applyPrimaryToMedia(created));
        primaryAssigned = true;
      } else {
        results.push(created);
      }
    }

    if (dto.isPrimary && !primaryAssigned) {
      throw new BadRequestException(
        'isPrimary requiert au moins une image dans le lot',
      );
    }

    return results;
  }

  /**
   * Définit un média comme image principale pour son entité (établissement, ville, pays, ligne service…).
   * Vérifie les droits (`findOne`), puis applique la règle « un seul primaire par entité ».
   */
  async setPrimary(mediaId: string, prestataireId: string) {
    const doc = await this.findOne(mediaId, prestataireId);
    return this.applyPrimaryToMedia(doc);
  }

  /**
   * Liste « mes médias » : filtre `prestataire` + contrôle propriétaire si filtres parent.
   * Détail / suppression : voir `findOne` (vérifie le parent réel).
   */
  async findAll(prestataireId: string, query: ListMediaQueryDto) {
    if (query.etablissementId && query.etablissementServiceId) {
      throw new BadRequestException(
        'Utilisez au plus un filtre : etablissementId ou etablissementServiceId.',
      );
    }

    const filter: Record<string, unknown> = {
      prestataire: new Types.ObjectId(prestataireId),
    };

    if (query.etablissementId) {
      await this.assertPrestataireOwnsEtablissement(
        query.etablissementId,
        prestataireId,
      );
      const oid = new Types.ObjectId(query.etablissementId);
      filter.$or = [
        { etablissementId: oid },
        { entityType: 'etablissement', entityId: oid },
      ];
    }

    if (query.etablissementServiceId) {
      await this.assertPrestataireOwnsEtablissementService(
        query.etablissementServiceId,
        prestataireId,
      );
      const oid = new Types.ObjectId(query.etablissementServiceId);
      filter.$or = [
        { etablissementServiceId: oid },
        { entityType: 'service', entityId: oid },
      ];
    }

    return this.mediaModel
      .find(filter)
      .sort({ isPrimary: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string, prestataireId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant média invalide');
    }
    const doc = await this.mediaModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Média introuvable');
    }
    await this.assertPrestataireOwnsMediaLinkedResource(doc, prestataireId);
    return doc;
  }

  async remove(id: string, prestataireId: string) {
    // findOne vérifie déjà la propriété via l’établissement / la ligne service.
    const doc = await this.findOne(id, prestataireId);
    try {
      await this.uploads.removeObject(doc.objectKey);
    } catch {
      // Fichier déjà absent côté stockage : on supprime quand même la ligne DB.
    }
    await doc.deleteOne();
    return { deleted: true, id };
  }
}
