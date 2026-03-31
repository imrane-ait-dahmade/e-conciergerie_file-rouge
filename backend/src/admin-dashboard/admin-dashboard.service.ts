import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Caracteristique } from '../caracteristiques/schemas/caracteristique.schema';
import { Domaine } from '../domaines/schemas/domaine.schema';
import {
  EtablissementService,
} from '../etablissement-services/schemas/etablissement-service.schema';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { Media } from '../media/schemas/media.schema';
import { Quartier } from '../quartiers/schemas/quartier.schema';
import { Role } from '../roles/schemas/role.schema';
import { ROLE_NAMES } from '../roles/seeds/roles.seed';
import { Service } from '../services/schemas/service.schema';
import { User } from '../users/schemas/user.schema';
import { Ville } from '../villes/schemas/ville.schema';
import type { AdminDashboardStatsResponse } from './dto/admin-dashboard-stats.response';

const RECENT_LIMIT = 8;

@Injectable()
export class AdminDashboardService {
  private readonly collRoles: string;
  private readonly collDomaines: string;
  private readonly collVilles: string;
  private readonly collServices: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Domaine.name) private readonly domaineModel: Model<Domaine>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Caracteristique.name)
    private readonly caracteristiqueModel: Model<Caracteristique>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(EtablissementService.name)
    private readonly liaisonModel: Model<EtablissementService>,
    @InjectModel(Ville.name) private readonly villeModel: Model<Ville>,
    @InjectModel(Quartier.name) private readonly quartierModel: Model<Quartier>,
    @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
  ) {
    this.collRoles = this.roleModel.collection.collectionName;
    this.collDomaines = this.domaineModel.collection.collectionName;
    this.collVilles = this.villeModel.collection.collectionName;
    this.collServices = this.serviceModel.collection.collectionName;
  }

  async getStats(): Promise<AdminDashboardStatsResponse> {
    const [adminRole, prestataireRole, clientRole] = await Promise.all([
      this.roleModel.findOne({ name: ROLE_NAMES.ADMIN }).lean(),
      this.roleModel.findOne({ name: ROLE_NAMES.PRESTATAIRE }).lean(),
      this.roleModel.findOne({ name: ROLE_NAMES.CLIENT }).lean(),
    ]);

    const adminId = adminRole?._id;
    const prestataireId = prestataireRole?._id;
    const clientId = clientRole?._id;

    const [
      totalUsers,
      totalAdmins,
      totalProviders,
      totalTravelers,
      totalDomains,
      totalServices,
      totalCharacteristics,
      totalEstablishments,
      totalEstablishmentServices,
      totalCities,
      totalDistricts,
      totalMedia,
      activeEstablishments,
      inactiveEstablishments,
      activeLiaisons,
      inactiveLiaisons,
      activeProviders,
      usersByRole,
      establishmentsByDomain,
      establishmentsByCity,
      establishmentServicesByDomain,
      recentUsers,
      recentEstablishments,
      recentEstablishmentServices,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      adminId
        ? this.userModel.countDocuments({ role: adminId })
        : Promise.resolve(0),
      prestataireId
        ? this.userModel.countDocuments({ role: prestataireId })
        : Promise.resolve(0),
      clientId
        ? this.userModel.countDocuments({ role: clientId })
        : Promise.resolve(0),
      this.domaineModel.countDocuments(),
      this.serviceModel.countDocuments(),
      this.caracteristiqueModel.countDocuments(),
      this.etablissementModel.countDocuments(),
      this.liaisonModel.countDocuments(),
      this.villeModel.countDocuments(),
      this.quartierModel.countDocuments(),
      this.mediaModel.countDocuments(),
      this.etablissementModel.countDocuments({ isActive: true }),
      this.etablissementModel.countDocuments({ isActive: false }),
      this.liaisonModel.countDocuments({ isActive: true }),
      this.liaisonModel.countDocuments({ isActive: false }),
      prestataireId
        ? this.userModel.countDocuments({
            role: prestataireId,
            isActive: true,
          })
        : Promise.resolve(0),
      this.aggregateUsersByRole(),
      this.aggregateEstablishmentsByDomain(),
      this.aggregateEstablishmentsByCity(),
      this.aggregateEstablishmentServicesByDomain(),
      this.loadRecentUsers(),
      this.loadRecentEstablishments(),
      this.loadRecentEstablishmentServices(),
    ]);

    return {
      summary: {
        totalUsers,
        totalAdmins,
        totalProviders,
        totalTravelers,
        totalDomains,
        totalServices,
        totalCharacteristics,
        totalEstablishments,
        totalEstablishmentServices,
        totalCities,
        totalDistricts,
        totalMedia,
      },
      charts: {
        usersByRole,
        establishmentsByDomain,
        establishmentsByCity,
        establishmentServicesByDomain,
      },
      recent: {
        recentUsers,
        recentEstablishments,
        recentEstablishmentServices,
      },
      status: {
        activeEstablishments,
        inactiveEstablishments,
        /** Offres établissement ↔ service (`EtablissementService.isActive`). */
        activeServices: activeLiaisons,
        inactiveServices: inactiveLiaisons,
        activeProviders,
      },
    };
  }

  private async aggregateUsersByRole(): Promise<
    AdminDashboardStatsResponse['charts']['usersByRole']
  > {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: this.collRoles,
          localField: 'role',
          foreignField: '_id',
          as: 'roleDoc',
        },
      },
      { $unwind: { path: '$roleDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$roleDoc.name',
          label: { $first: '$roleDoc.label' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];
    const rows = await this.userModel.aggregate<{
      _id: string | null;
      label?: string;
      count: number;
    }>(pipeline);
    return rows.map((r) => ({
      role: r._id ?? 'inconnu',
      label: r.label,
      count: r.count,
    }));
  }

  private async aggregateEstablishmentsByDomain(): Promise<
    AdminDashboardStatsResponse['charts']['establishmentsByDomain']
  > {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: this.collDomaines,
          localField: 'domaine',
          foreignField: '_id',
          as: 'd',
        },
      },
      {
        $addFields: {
          domainName: {
            $cond: [
              { $gt: [{ $size: '$d' }, 0] },
              { $arrayElemAt: ['$d.nom', 0] },
              'Sans domaine',
            ],
          },
          domainId: {
            $cond: [
              { $gt: [{ $size: '$d' }, 0] },
              { $arrayElemAt: ['$d._id', 0] },
              null,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$domainId',
          domainName: { $first: '$domainName' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];
    const rows = await this.etablissementModel
      .aggregate<{
        _id: Types.ObjectId | null;
        domainName: string;
        count: number;
      }>(pipeline)
      .exec();
    return rows.map((r) => ({
      domainId: r._id ? String(r._id) : null,
      domainName: r.domainName,
      count: r.count,
    }));
  }

  private async aggregateEstablishmentsByCity(): Promise<
    AdminDashboardStatsResponse['charts']['establishmentsByCity']
  > {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: this.collVilles,
          localField: 'ville',
          foreignField: '_id',
          as: 'v',
        },
      },
      {
        $addFields: {
          cityName: {
            $cond: [
              { $gt: [{ $size: '$v' }, 0] },
              { $arrayElemAt: ['$v.nom', 0] },
              'Sans ville',
            ],
          },
          cityId: {
            $cond: [
              { $gt: [{ $size: '$v' }, 0] },
              { $arrayElemAt: ['$v._id', 0] },
              null,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$cityId',
          cityName: { $first: '$cityName' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ];
    const rows = await this.etablissementModel
      .aggregate<{
        _id: Types.ObjectId | null;
        cityName: string;
        count: number;
      }>(pipeline)
      .exec();
    return rows.map((r) => ({
      cityId: r._id ? String(r._id) : null,
      cityName: r.cityName,
      count: r.count,
    }));
  }

  private async aggregateEstablishmentServicesByDomain(): Promise<
    AdminDashboardStatsResponse['charts']['establishmentServicesByDomain']
  > {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: this.collServices,
          localField: 'service',
          foreignField: '_id',
          as: 'svc',
        },
      },
      { $unwind: { path: '$svc', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: this.collDomaines,
          localField: 'svc.domaine',
          foreignField: '_id',
          as: 'dom',
        },
      },
      { $unwind: { path: '$dom', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$dom._id',
          domainName: {
            $first: { $ifNull: ['$dom.nom', 'Sans domaine'] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];
    const rows = await this.liaisonModel
      .aggregate<{
        _id: Types.ObjectId | null;
        domainName: string;
        count: number;
      }>(pipeline)
      .exec();
    return rows.map((r) => ({
      domainId: r._id ? String(r._id) : null,
      domainName: r.domainName,
      count: r.count,
    }));
  }

  private async loadRecentUsers(): Promise<
    AdminDashboardStatsResponse['recent']['recentUsers']
  > {
    const docs = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .populate<{ name: string; label?: string }>('role')
      .select('-password -refreshTokenHash')
      .lean()
      .exec();
    return docs.map((u) => ({
      id: String(u._id),
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      isActive: u.isActive,
      role:
        u.role && typeof u.role === 'object' && 'name' in u.role
          ? {
              name: (u.role as { name: string }).name,
              label: (u.role as { label?: string }).label,
            }
          : null,
      createdAt: u.createdAt,
    }));
  }

  private async loadRecentEstablishments(): Promise<
    AdminDashboardStatsResponse['recent']['recentEstablishments']
  > {
    const docs = await this.etablissementModel
      .find()
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .populate<{ nom: string }>('ville', 'nom')
      .populate<{ nom: string }>('domaine', 'nom')
      .select('nom isActive ville domaine createdAt')
      .lean()
      .exec();
    return docs.map((e) => {
      const ville =
        e.ville && typeof e.ville === 'object' && 'nom' in e.ville
          ? { id: String((e.ville as { _id: Types.ObjectId })._id), nom: (e.ville as { nom: string }).nom }
          : null;
      const domaine =
        e.domaine && typeof e.domaine === 'object' && '_id' in e.domaine
          ? {
              id: String((e.domaine as { _id: Types.ObjectId })._id),
              nom: (e.domaine as { nom?: string }).nom ?? '',
            }
          : null;
      return {
        id: String(e._id),
        nom: e.nom,
        isActive: e.isActive,
        ville,
        domaine,
        createdAt: e.createdAt,
      };
    });
  }

  private async loadRecentEstablishmentServices(): Promise<
    AdminDashboardStatsResponse['recent']['recentEstablishmentServices']
  > {
    const docs = await this.liaisonModel
      .find()
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .populate<{ nom: string }>('etablissement', 'nom')
      .populate<{ nom: string; domaine?: Types.ObjectId }>('service', 'nom domaine')
      .select('etablissement service isActive prix createdAt')
      .lean()
      .exec();

    const domainIds = [
      ...new Set(
        docs
          .map((row) =>
            row.service &&
            typeof row.service === 'object' &&
            'domaine' in row.service
              ? (row.service as { domaine?: Types.ObjectId }).domaine
              : undefined,
          )
          .filter((id): id is Types.ObjectId => id != null),
      ),
    ];

    const domaines =
      domainIds.length > 0
        ? await this.domaineModel
            .find({ _id: { $in: domainIds } })
            .select('nom')
            .lean()
            .exec()
        : [];
    const domainById = new Map(
      domaines.map((d) => [String(d._id), d.nom ?? '']),
    );

    return docs.map((row) => {
      const etab =
        row.etablissement &&
        typeof row.etablissement === 'object' &&
        'nom' in row.etablissement
          ? {
              id: String((row.etablissement as { _id: Types.ObjectId })._id),
              nom: (row.etablissement as { nom: string }).nom,
            }
          : null;
      const svc = row.service &&
        typeof row.service === 'object' &&
        'nom' in row.service
        ? {
            id: String((row.service as { _id: Types.ObjectId })._id),
            nom: (row.service as { nom: string }).nom,
            domaineId:
              (row.service as { domaine?: Types.ObjectId }).domaine != null
                ? String((row.service as { domaine: Types.ObjectId }).domaine)
                : null,
            domaineNom:
              (row.service as { domaine?: Types.ObjectId }).domaine != null
                ? domainById.get(
                    String((row.service as { domaine: Types.ObjectId }).domaine),
                  ) ?? null
                : null,
          }
        : null;
      return {
        id: String(row._id),
        isActive: row.isActive,
        prix: row.prix ?? null,
        etablissement: etab,
        service: svc,
        createdAt: row.createdAt,
      };
    });
  }
}
