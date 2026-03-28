import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Caracteristique } from '../caracteristiques/schemas/caracteristique.schema';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { EtablissementService } from '../etablissement-services/schemas/etablissement-service.schema';
import { EtablissementServiceCaracteristique } from '../etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';
import { CreateProviderEtablissementServiceCaracteristiqueDto } from './dto/create-provider-etablissement-service-caracteristique.dto';
import { UpdateProviderEtablissementServiceCaracteristiqueDto } from './dto/update-provider-etablissement-service-caracteristique.dto';

/**
 * Chaîne de propriété (prestataire = JWT) :
 *
 * `EtablissementServiceCaracteristique` → `EtablissementService` → `Etablissement` → `prestataire`.
 *
 * Toute lecture/écriture vérifie que l’établissement parent appartient au prestataire.
 * Le **catalogue** `Caracteristique` (admin) est seulement lu pour valider un id ou copier un libellé ;
 * les documents du catalogue ne sont jamais modifiés ici.
 */
@Injectable()
export class ProviderEtablissementServiceCaracteristiquesService {
  constructor(
    @InjectModel(EtablissementServiceCaracteristique.name)
    private readonly escModel: Model<EtablissementServiceCaracteristique>,
    @InjectModel(EtablissementService.name)
    private readonly esModel: Model<EtablissementService>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(Caracteristique.name)
    private readonly caracteristiqueModel: Model<Caracteristique>,
  ) {}

  private assertValidObjectId(id: string, label: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Identifiant ${label} invalide`);
    }
  }

  private isMongoDuplicateKey(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: number }).code === 11000
    );
  }

  /**
   * La liaison établissement–service doit exister et son établissement doit être à moi.
   */
  private async assertEtablissementServiceOwnedBy(
    etablissementServiceId: string,
    userId: string,
  ): Promise<void> {
    this.assertValidObjectId(etablissementServiceId, 'offre');
    const es = await this.esModel
      .findById(etablissementServiceId)
      .select('etablissement')
      .lean()
      .exec();
    if (!es) {
      throw new NotFoundException('Assignation établissement–service introuvable');
    }
    const ok = await this.etablissementModel.exists({
      _id: es.etablissement,
      prestataire: new Types.ObjectId(userId),
    });
    if (!ok) {
      throw new NotFoundException('Assignation établissement–service introuvable');
    }
  }

  /**
   * La ligne ESC doit exister ; l’offre parente doit m’appartenir.
   */
  private async assertEscOwnedBy(
    escId: string,
    userId: string,
  ): Promise<void> {
    this.assertValidObjectId(escId, 'caractéristique');
    const row = await this.escModel
      .findById(escId)
      .select('etablissementService')
      .lean()
      .exec();
    if (!row) {
      throw new NotFoundException('Caractéristique d’offre introuvable');
    }
    await this.assertEtablissementServiceOwnedBy(
      String(row.etablissementService),
      userId,
    );
  }

  async findAllForEstablishmentService(
    etablissementServiceId: string,
    userId: string,
  ) {
    await this.assertEtablissementServiceOwnedBy(etablissementServiceId, userId);
    return this.escModel
      .find({
        etablissementService: new Types.ObjectId(etablissementServiceId),
      })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }

  async createForEstablishmentService(
    etablissementServiceId: string,
    dto: CreateProviderEtablissementServiceCaracteristiqueDto,
    userId: string,
  ) {
    await this.assertEtablissementServiceOwnedBy(etablissementServiceId, userId);

    let libelle: string;
    if (dto.caracteristiqueCatalogId) {
      this.assertValidObjectId(dto.caracteristiqueCatalogId, 'catalogue');
      const cat = await this.caracteristiqueModel
        .findById(dto.caracteristiqueCatalogId)
        .select('libelle')
        .lean()
        .exec();
      if (!cat) {
        throw new NotFoundException('Caractéristique (catalogue) introuvable');
      }
      libelle = cat.libelle.trim();
    } else {
      libelle = dto.libelle!.trim();
    }

    const valeur = dto.valeur.trim();
    const esOid = new Types.ObjectId(etablissementServiceId);

    const dup = await this.escModel.exists({
      etablissementService: esOid,
      libelle,
    });
    if (dup) {
      throw new ConflictException(
        'Une caractéristique avec ce libellé existe déjà pour cette offre.',
      );
    }

    try {
      const created = await this.escModel.create({
        etablissementService: esOid,
        libelle,
        valeur,
      });
      return created.toObject();
    } catch (err: unknown) {
      if (this.isMongoDuplicateKey(err)) {
        throw new ConflictException(
          'Une caractéristique avec ce libellé existe déjà pour cette offre.',
        );
      }
      throw err;
    }
  }

  async update(
    id: string,
    dto: UpdateProviderEtablissementServiceCaracteristiqueDto,
    userId: string,
  ) {
    await this.assertEscOwnedBy(id, userId);

    if (dto.libelle === undefined && dto.valeur === undefined) {
      throw new BadRequestException('Aucun champ à mettre à jour');
    }

    const doc = await this.escModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Caractéristique d’offre introuvable');
    }

    const newLibelle =
      dto.libelle !== undefined ? dto.libelle.trim() : doc.libelle;
    const newValeur =
      dto.valeur !== undefined ? dto.valeur.trim() : doc.valeur;

    if (dto.libelle !== undefined && newLibelle !== doc.libelle) {
      const dup = await this.escModel.exists({
        etablissementService: doc.etablissementService,
        libelle: newLibelle,
        _id: { $ne: doc._id },
      });
      if (dup) {
        throw new ConflictException(
          'Une caractéristique avec ce libellé existe déjà pour cette offre.',
        );
      }
    }

    doc.libelle = newLibelle;
    doc.valeur = newValeur;
    try {
      await doc.save();
    } catch (err: unknown) {
      if (this.isMongoDuplicateKey(err)) {
        throw new ConflictException(
          'Une caractéristique avec ce libellé existe déjà pour cette offre.',
        );
      }
      throw err;
    }
    return doc.toObject();
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.assertEscOwnedBy(id, userId);
    const res = await this.escModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Caractéristique d’offre introuvable');
    }
  }
}
