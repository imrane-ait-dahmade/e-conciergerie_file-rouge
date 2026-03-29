/**
 * Service CRUD pour les établissements.
 * - create : prestataire = utilisateur connecté
 * - update / delete : uniquement le propriétaire (prestataire)
 */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Etablissement } from './schemas/etablissement.schema';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { UpdateEtablissementDto } from './dto/update-etablissement.dto';

@Injectable()
export class EtablissementsService {
  constructor(
    @InjectModel(Etablissement.name)
    private etablissementModel: Model<Etablissement>,
  ) {}

  /**
   * Créer un établissement.
   * prestataire = userId de l'utilisateur connecté (passé par le contrôleur).
   */
  async create(dto: CreateEtablissementDto, userId: string) {
    const data = {
      ...dto,
      prestataire: new mongoose.Types.ObjectId(userId),
    };
    return this.etablissementModel.create(data);
  }

  /**
   * Liste tous les établissements (route publique).
   */
  async findAll() {
    return this.etablissementModel.find();
  }

  /**
   * Section accueil « Best providers » : uniquement établissements actifs et mis en avant.
   */
  async findHomeBestProviders(limit = 12) {
    const cap = Math.min(Math.max(limit, 1), 50);
    return this.etablissementModel
      .find({
        isActive: true,
        isFeaturedForHomeBestProviders: true,
      })
      .sort({ bestProviderSortOrder: 1, createdAt: -1 })
      .limit(cap)
      .populate({ path: 'ville', select: 'nom' })
      .select(
        'nom slug logo coverImage image ville averageRating reviewCount bestProviderSortOrder',
      )
      .lean()
      .exec();
  }

  /**
   * Best providers pour l’app mobile : même filtre, tri explicite pour la home
   * (ordre d’affichage, note moyenne, id).
   */
  async findMobileBestProviders(limit = 20) {
    const cap = Math.min(Math.max(limit, 1), 50);
    return this.etablissementModel
      .find({
        isActive: true,
        isFeaturedForHomeBestProviders: true,
      })
      .sort({
        bestProviderSortOrder: 1,
        averageRating: -1,
        _id: -1,
      })
      .limit(cap)
      .populate({ path: 'ville', select: 'nom' })
      .select(
        'nom slug logo coverImage image ville averageRating reviewCount bestProviderSortOrder',
      )
      .lean()
      .exec();
  }

  /**
   * Trouver un établissement par ID (route publique).
   */
  async findOne(id: string) {
    const etablissement = await this.etablissementModel.findById(id);
    if (!etablissement) {
      throw new NotFoundException('Établissement introuvable');
    }
    return etablissement;
  }

  /**
   * Vérifier que l'utilisateur est le propriétaire (prestataire).
   */
  private async verifierProprietaire(
    id: string,
    userId: string,
  ): Promise<void> {
    const etablissement = await this.etablissementModel
      .findById(id)
      .select('prestataire')
      .lean();
    if (!etablissement) {
      throw new NotFoundException('Établissement introuvable');
    }
    if (String(etablissement.prestataire) !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier cet établissement',
      );
    }
  }

  /**
   * Mettre à jour un établissement. Uniquement le propriétaire.
   */
  async update(id: string, dto: UpdateEtablissementDto, userId: string) {
    await this.verifierProprietaire(id, userId);
    return this.etablissementModel.findByIdAndUpdate(id, dto, { new: true });
  }

  /**
   * Supprimer un établissement. Uniquement le propriétaire.
   */
  async delete(id: string, userId: string) {
    await this.verifierProprietaire(id, userId);
    const result = await this.etablissementModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Établissement introuvable');
    }
    return result;
  }
}
