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
import { UploadsService } from '../uploads/uploads.service';
import { ListMediaQueryDto } from './dto/list-media-query.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Media, MediaKind } from './schemas/media.schema';
import type { FilterQuery } from 'mongoose';

function detectMediaKind(mimetype: string): MediaKind | null {
  if (mimetype.startsWith('image/')) {
    return 'image';
  }
  if (mimetype.startsWith('video/')) {
    return 'video';
  }
  return null;
}

/** Filtre Mongo pour « même scope » qu’un document (legacy + champs génériques). */
function primaryScopeFilter(doc: Media): FilterQuery<Media> | null {
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

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(EtablissementService.name)
    private readonly etablissementServiceModel: Model<EtablissementService>,
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
      throw new ForbiddenException(
        'Les médias ville / pays ne sont pas gérés dans cet espace prestataire pour le moment',
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
    const id = new Types.ObjectId(String((doc as { id: string }).id));
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
    if (hasEtab === hasEs) {
      throw new BadRequestException(
        'Indiquez exactement un des deux : etablissementId OU etablissementServiceId.',
      );
    }
  }

  private async assertPrestataireOwnsUploadTarget(
    dto: UploadMediaDto,
    prestataireId: string,
  ): Promise<void> {
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
    dto: UploadMediaDto,
    prestataireId: string,
    kind: MediaKind,
  ): Promise<Media> {
    const safe = file.originalname.replace(/[^\w.-]+/g, '_') || 'file';
    const objectKey = `media/${prestataireId}/${randomUUID()}-${safe}`;
    const uploaded = await this.uploads.uploadFileWithKey(file, objectKey);
    const url = this.buildPublicUrl(uploaded.bucket, uploaded.key);

    const etabOid = dto.etablissementId
      ? new Types.ObjectId(dto.etablissementId)
      : undefined;
    const esOid = dto.etablissementServiceId
      ? new Types.ObjectId(dto.etablissementServiceId)
      : undefined;

    return this.mediaModel.create({
      url,
      bucket: uploaded.bucket,
      objectKey: uploaded.key,
      type: kind,
      mimeType: file.mimetype,
      sizeBytes: uploaded.size,
      originalFilename: file.originalname,
      prestataire: new Types.ObjectId(prestataireId),
      etablissementId: etabOid,
      etablissementServiceId: esOid,
      entityType: etabOid
        ? ('etablissement' as const)
        : esOid
          ? ('service' as const)
          : undefined,
      entityId: etabOid ?? esOid,
      isPrimary: false,
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
      dto,
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
        dto,
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
