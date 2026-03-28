import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Avis } from '../avis/schemas/avis.schema';
import { Domaine } from '../domaines/schemas/domaine.schema';
import {
  EtablissementService,
} from '../etablissement-services/schemas/etablissement-service.schema';
import { Favori } from '../favoris/schemas/favori.schema';
import { Pays } from '../pays/schemas/pays.schema';
import { Quartier } from '../quartiers/schemas/quartier.schema';
import { Reservation } from '../reservations/schemas/reservation.schema';
import { ROLE_NAMES } from '../roles/seeds/roles.seed';
import { User } from '../users/schemas/user.schema';
import { Ville } from '../villes/schemas/ville.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AdminCreateEtablissementDto } from './dto/admin-create-etablissement.dto';
import { AdminUpdateEtablissementDto } from './dto/admin-update-etablissement.dto';
import { UpdateEtablissementStatusDto } from './dto/update-etablissement-status.dto';
import { Etablissement } from './schemas/etablissement.schema';

type GeoInput = {
  pays?: string;
  ville?: string;
  quartier?: string;
};

@Injectable()
export class AdminEtablissementsService {
  constructor(
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Domaine.name) private readonly domaineModel: Model<Domaine>,
    @InjectModel(Pays.name) private readonly paysModel: Model<Pays>,
    @InjectModel(Ville.name) private readonly villeModel: Model<Ville>,
    @InjectModel(Quartier.name) private readonly quartierModel: Model<Quartier>,
    @InjectModel(EtablissementService.name)
    private readonly etablissementServiceModel: Model<EtablissementService>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
    @InjectModel(Favori.name) private readonly favoriModel: Model<Favori>,
    @InjectModel(Avis.name) private readonly avisModel: Model<Avis>,
  ) {}

  private assertValidObjectId(id: string, label = 'établissement'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Identifiant ${label} invalide`);
    }
  }

  private getRoleNameFromUser(user: { role?: unknown }): string | null {
    const r = user.role;
    if (r && typeof r === 'object' && r !== null && 'name' in r) {
      return String((r as { name: string }).name);
    }
    return null;
  }

  /** Le propriétaire doit être un utilisateur existant avec le rôle prestataire. */
  private async assertPrestataireUser(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).populate('role').lean();
    if (!user) {
      throw new NotFoundException('Utilisateur (prestataire) introuvable');
    }
    const name = this.getRoleNameFromUser(user as { role?: unknown });
    if (name !== ROLE_NAMES.PRESTATAIRE) {
      throw new BadRequestException(
        'Le propriétaire doit être un utilisateur au rôle « prestataire ».',
      );
    }
  }

  private async assertDomaineExists(id: string): Promise<void> {
    const ok = await this.domaineModel.exists({ _id: new Types.ObjectId(id) });
    if (!ok) {
      throw new NotFoundException('Domaine introuvable');
    }
  }

  /**
   * Ville / quartier / pays : vérifie les documents et aligne pays ↔ ville ↔ quartier.
   */
  private async normalizeGeo(input: GeoInput): Promise<{
    pays?: Types.ObjectId;
    ville?: Types.ObjectId;
    quartier?: Types.ObjectId;
  }> {
    let paysId = input.pays ? new Types.ObjectId(input.pays) : undefined;
    let villeId = input.ville ? new Types.ObjectId(input.ville) : undefined;
    let quartierId = input.quartier
      ? new Types.ObjectId(input.quartier)
      : undefined;

    if (quartierId) {
      const q = await this.quartierModel.findById(quartierId).lean();
      if (!q) {
        throw new NotFoundException('Quartier introuvable');
      }
      const qVille = q.ville as Types.ObjectId;
      if (villeId && !qVille.equals(villeId)) {
        throw new BadRequestException(
          'Le quartier ne correspond pas à la ville indiquée.',
        );
      }
      if (!villeId) {
        villeId = qVille;
      }
    }

    if (villeId) {
      const v = await this.villeModel.findById(villeId).lean();
      if (!v) {
        throw new NotFoundException('Ville introuvable');
      }
      const vPays = v.pays as Types.ObjectId;
      if (paysId && !vPays.equals(paysId)) {
        throw new BadRequestException(
          'La ville ne correspond pas au pays (nation) indiqué.',
        );
      }
      if (!paysId) {
        paysId = vPays;
      }
    }

    if (paysId) {
      const p = await this.paysModel.findById(paysId).lean();
      if (!p) {
        throw new NotFoundException('Pays introuvable');
      }
    }

    return { pays: paysId, ville: villeId, quartier: quartierId };
  }

  private populatePaths() {
    return [
      {
        path: 'prestataire',
        select: 'nom prenom email isActive',
        populate: { path: 'role', select: 'name label' },
      },
      { path: 'domaine', select: 'nom description' },
      { path: 'pays', select: 'nom code' },
      {
        path: 'ville',
        select: 'nom',
        populate: { path: 'pays', select: 'nom code' },
      },
      {
        path: 'quartier',
        select: 'nom',
        populate: {
          path: 'ville',
          select: 'nom',
          populate: { path: 'pays', select: 'nom code' },
        },
      },
    ] as const;
  }

  async findAllPaginated(query?: PaginationQueryDto) {
    const page = query?.page != null && query.page > 0 ? query.page : 1;
    const limit = Math.min(
      query?.limit != null && query.limit > 0 ? query.limit : 20,
      100,
    );
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.etablissementModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate([...this.populatePaths()])
        .lean()
        .exec(),
      this.etablissementModel.countDocuments().exec(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    this.assertValidObjectId(id);
    const doc = await this.etablissementModel
      .findById(id)
      .populate([...this.populatePaths()])
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException('Établissement introuvable');
    }
    return doc;
  }

  async create(dto: AdminCreateEtablissementDto) {
    await this.assertPrestataireUser(dto.prestataire);

    if (dto.domaine) {
      await this.assertDomaineExists(dto.domaine);
    }

    const geo = await this.normalizeGeo({
      pays: dto.pays,
      ville: dto.ville,
      quartier: dto.quartier,
    });

    const doc = await this.etablissementModel.create({
      nom: dto.nom.trim(),
      prestataire: new Types.ObjectId(dto.prestataire),
      adresse: dto.adresse?.trim(),
      latitude: dto.latitude,
      longitude: dto.longitude,
      description: dto.description?.trim(),
      telephone: dto.telephone?.trim(),
      email: dto.email?.toLowerCase().trim(),
      image: dto.image?.trim(),
      isActive: dto.isActive ?? true,
      ...(dto.domaine && { domaine: new Types.ObjectId(dto.domaine) }),
      ...geo,
    });

    return this.findOne(String(doc._id));
  }

  async update(id: string, dto: AdminUpdateEtablissementDto) {
    this.assertValidObjectId(id);
    const existing = await this.etablissementModel.findById(id).lean();
    if (!existing) {
      throw new NotFoundException('Établissement introuvable');
    }

    if (dto.prestataire !== undefined) {
      await this.assertPrestataireUser(dto.prestataire);
    }

    if (dto.domaine !== undefined) {
      await this.assertDomaineExists(dto.domaine);
    }

    const geoInput: GeoInput = {};
    if (dto.pays !== undefined) geoInput.pays = dto.pays;
    if (dto.ville !== undefined) geoInput.ville = dto.ville;
    if (dto.quartier !== undefined) geoInput.quartier = dto.quartier;

    let geoResolved:
      | { pays?: Types.ObjectId; ville?: Types.ObjectId; quartier?: Types.ObjectId }
      | undefined;

    if (
      dto.pays !== undefined ||
      dto.ville !== undefined ||
      dto.quartier !== undefined
    ) {
      geoResolved = await this.normalizeGeo({
        pays:
          dto.pays !== undefined
            ? dto.pays
            : existing.pays
              ? String(existing.pays)
              : undefined,
        ville:
          dto.ville !== undefined
            ? dto.ville
            : existing.ville
              ? String(existing.ville)
              : undefined,
        quartier:
          dto.quartier !== undefined
            ? dto.quartier
            : existing.quartier
              ? String(existing.quartier)
              : undefined,
      });
    }

    const set: Record<string, unknown> = {};

    if (dto.nom !== undefined) set.nom = dto.nom.trim();
    if (dto.prestataire !== undefined) {
      set.prestataire = new Types.ObjectId(dto.prestataire);
    }
    if (dto.adresse !== undefined) set.adresse = dto.adresse?.trim();
    if (dto.latitude !== undefined) set.latitude = dto.latitude;
    if (dto.longitude !== undefined) set.longitude = dto.longitude;
    if (dto.description !== undefined) set.description = dto.description?.trim();
    if (dto.telephone !== undefined) set.telephone = dto.telephone?.trim();
    if (dto.email !== undefined) set.email = dto.email?.toLowerCase().trim();
    if (dto.image !== undefined) set.image = dto.image?.trim();
    if (dto.domaine !== undefined) {
      set.domaine = new Types.ObjectId(dto.domaine);
    }

    if (geoResolved) {
      if (geoResolved.pays !== undefined) set.pays = geoResolved.pays;
      if (geoResolved.ville !== undefined) set.ville = geoResolved.ville;
      if (geoResolved.quartier !== undefined) {
        set.quartier = geoResolved.quartier;
      }
    }

    if (Object.keys(set).length === 0) {
      return this.findOne(id);
    }

    await this.etablissementModel.findByIdAndUpdate(id, { $set: set }).exec();
    return this.findOne(id);
  }

  async updateStatus(id: string, dto: UpdateEtablissementStatusDto) {
    this.assertValidObjectId(id);
    const res = await this.etablissementModel
      .findByIdAndUpdate(id, { $set: { isActive: dto.isActive } }, { new: true })
      .exec();
    if (!res) {
      throw new NotFoundException('Établissement introuvable');
    }
    return this.findOne(id);
  }

  /**
   * Suppression définitive uniquement si aucune donnée liée (offres, réservations, etc.).
   * Sinon : désactiver avec PATCH …/status (`isActive: false`).
   */
  async remove(id: string): Promise<void> {
    this.assertValidObjectId(id);
    const existing = await this.etablissementModel.findById(id).lean();
    if (!existing) {
      throw new NotFoundException('Établissement introuvable');
    }

    const eid = new Types.ObjectId(id);
    const reasons: string[] = [];

    const add = async (label: string, count: Promise<number>) => {
      const n = await count;
      if (n > 0) reasons.push(`${label} (${n})`);
    };

    await add(
      'offres établissement–service',
      this.etablissementServiceModel.countDocuments({ etablissement: eid }).exec(),
    );
    await add(
      'réservations',
      this.reservationModel.countDocuments({ etablissement: eid }).exec(),
    );
    await add(
      'favoris',
      this.favoriModel.countDocuments({ etablissement: eid }).exec(),
    );
    await add(
      'avis',
      this.avisModel.countDocuments({ etablissement: eid }).exec(),
    );

    if (reasons.length > 0) {
      throw new ConflictException(
        `Suppression impossible : ${reasons.join(
          ' ; ',
        )}. Préférez la désactivation (PATCH /admin/etablissements/:id/status).`,
      );
    }

    await this.etablissementModel.findByIdAndDelete(id).exec();
  }
}
