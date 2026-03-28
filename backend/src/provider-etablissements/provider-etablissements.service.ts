import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { UpdateEtablissementStatusDto } from '../etablissements/dto/update-etablissement-status.dto';
import { ProviderCreateEtablissementDto } from './dto/provider-create-etablissement.dto';
import { ProviderUpdateEtablissementDto } from './dto/provider-update-etablissement.dto';

/**
 * Accès prestataire : toutes les requêtes filtrent par `prestataire` = l’utilisateur JWT.
 *
 * Filtrage d’appartenance :
 * - Liste : `find({ prestataire: userId })` → seulement ses établissements.
 * - Détail / mise à jour : `findOne({ _id, prestataire: userId })` → si aucun document,
 *   on renvoie 404 (on ne dit pas si l’id existe chez un autre prestataire).
 */
@Injectable()
export class ProviderEtablissementsService {
  constructor(
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
  ) {}

  private assertValidId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant invalide');
    }
  }

  private optionalRef(id?: string): Types.ObjectId | undefined {
    if (id === undefined || id === '') {
      return undefined;
    }
    return new Types.ObjectId(id);
  }

  async findAllForProvider(userId: string) {
    return this.etablissementModel
      .find({ prestataire: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .populate([
        { path: 'ville', select: 'nom' },
        { path: 'quartier', select: 'nom' },
      ])
      .lean()
      .exec();
  }

  async findOneForProvider(id: string, userId: string) {
    this.assertValidId(id);
    const doc = await this.etablissementModel
      .findOne({
        _id: new Types.ObjectId(id),
        prestataire: new Types.ObjectId(userId),
      })
      .populate([
        { path: 'ville', select: 'nom' },
        { path: 'quartier', select: 'nom' },
      ])
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException('Établissement introuvable');
    }
    return doc;
  }

  async createForProvider(dto: ProviderCreateEtablissementDto, userId: string) {
    const prestataireOid = new Types.ObjectId(userId);
    const created = await this.etablissementModel.create({
      nom: dto.nom,
      prestataire: prestataireOid,
      ...(dto.adresse !== undefined && { adresse: dto.adresse }),
      ...(dto.latitude !== undefined && { latitude: dto.latitude }),
      ...(dto.longitude !== undefined && { longitude: dto.longitude }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.telephone !== undefined && { telephone: dto.telephone }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.image !== undefined && { image: dto.image }),
      ...(dto.domaine !== undefined && { domaine: this.optionalRef(dto.domaine) }),
      ...(dto.pays !== undefined && { pays: this.optionalRef(dto.pays) }),
      ...(dto.ville !== undefined && { ville: this.optionalRef(dto.ville) }),
      ...(dto.quartier !== undefined && { quartier: this.optionalRef(dto.quartier) }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    return created;
  }

  async updateForProvider(
    id: string,
    dto: ProviderUpdateEtablissementDto,
    userId: string,
  ) {
    this.assertValidId(id);
    const owned = await this.etablissementModel
      .findOne({
        _id: new Types.ObjectId(id),
        prestataire: new Types.ObjectId(userId),
      })
      .exec();
    if (!owned) {
      throw new NotFoundException('Établissement introuvable');
    }

    if (dto.nom !== undefined) owned.nom = dto.nom;
    if (dto.adresse !== undefined) owned.adresse = dto.adresse;
    if (dto.latitude !== undefined) owned.latitude = dto.latitude;
    if (dto.longitude !== undefined) owned.longitude = dto.longitude;
    if (dto.description !== undefined) owned.description = dto.description;
    if (dto.telephone !== undefined) owned.telephone = dto.telephone;
    if (dto.email !== undefined) owned.email = dto.email;
    if (dto.image !== undefined) owned.image = dto.image;
    if (dto.domaine !== undefined) owned.domaine = this.optionalRef(dto.domaine);
    if (dto.pays !== undefined) owned.pays = this.optionalRef(dto.pays);
    if (dto.ville !== undefined) owned.ville = this.optionalRef(dto.ville);
    if (dto.quartier !== undefined) owned.quartier = this.optionalRef(dto.quartier);

    await owned.save();
    return owned;
  }

  async updateStatusForProvider(
    id: string,
    dto: UpdateEtablissementStatusDto,
    userId: string,
  ) {
    this.assertValidId(id);
    const updated = await this.etablissementModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          prestataire: new Types.ObjectId(userId),
        },
        { $set: { isActive: dto.isActive } },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Établissement introuvable');
    }
    return updated;
  }
}
