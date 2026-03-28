import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Avis } from '../avis/schemas/avis.schema';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { EtablissementService } from '../etablissement-services/schemas/etablissement-service.schema';
import { EtablissementServiceCaracteristique } from '../etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';
import { Reservation } from '../reservations/schemas/reservation.schema';
import type { ProviderDashboardOverviewResponse } from './dto/provider-dashboard-overview.dto';

/**
 * Agrège uniquement les données du prestataire connecté (`prestataire` / établissements possédés).
 */
@Injectable()
export class ProviderDashboardService {
  constructor(
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(EtablissementService.name)
    private readonly etablissementServiceModel: Model<EtablissementService>,
    @InjectModel(EtablissementServiceCaracteristique.name)
    private readonly escModel: Model<EtablissementServiceCaracteristique>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
    @InjectModel(Avis.name)
    private readonly avisModel: Model<Avis>,
  ) {}

  async getOverview(userId: string): Promise<ProviderDashboardOverviewResponse> {
    const userOid = new Types.ObjectId(userId);

    const [
      establishmentsTotal,
      establishmentsActive,
      myEtablissementIds,
      myActiveEtablissementIds,
    ] = await Promise.all([
      this.etablissementModel.countDocuments({ prestataire: userOid }).exec(),
      this.etablissementModel
        .countDocuments({ prestataire: userOid, isActive: true })
        .exec(),
      this.etablissementModel
        .find({ prestataire: userOid })
        .distinct('_id')
        .exec() as Promise<Types.ObjectId[]>,
      this.etablissementModel
        .find({ prestataire: userOid, isActive: true })
        .distinct('_id')
        .exec() as Promise<Types.ObjectId[]>,
    ]);

    const myEtabIds = myEtablissementIds.map((id) =>
      id instanceof Types.ObjectId ? id : new Types.ObjectId(String(id)),
    );
    const myActiveEtabIds = myActiveEtablissementIds.map((id) =>
      id instanceof Types.ObjectId ? id : new Types.ObjectId(String(id)),
    );

    const establishmentServicesOnActiveEstablishments =
      myActiveEtabIds.length === 0
        ? 0
        : await this.etablissementServiceModel
            .countDocuments({ etablissement: { $in: myActiveEtabIds } })
            .exec();

    const myEsIds =
      myEtabIds.length === 0
        ? []
        : ((await this.etablissementServiceModel
            .find({ etablissement: { $in: myEtabIds } })
            .distinct('_id')
            .exec()) as Types.ObjectId[]);

    const caracteristiqueAssignments =
      myEsIds.length === 0
        ? 0
        : await this.escModel
            .countDocuments({
              etablissementService: {
                $in: myEsIds.map((id) =>
                  id instanceof Types.ObjectId ? id : new Types.ObjectId(String(id)),
                ),
              },
            })
            .exec();

    const reservationsTotal = await this.reservationModel
      .countDocuments({ prestataire: userOid })
      .exec();

    const reviewsTotal =
      myEtabIds.length === 0
        ? 0
        : await this.avisModel
            .countDocuments({ etablissement: { $in: myEtabIds } })
            .exec();

    const [reservationsByStatus, reviewAvg, recentReservations, recentReviews] =
      await Promise.all([
        this.aggregateReservationsByStatus(userOid),
        this.aggregateReviewAverage(myEtabIds),
        this.recentReservations(userOid),
        myEtabIds.length === 0
          ? Promise.resolve([])
          : this.recentReviews(myEtabIds),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      counts: {
        establishmentsTotal,
        establishmentsActive,
        establishmentServicesOnActiveEstablishments,
        caracteristiqueAssignments,
        reservationsTotal,
        reviewsTotal,
      },
      reservationsByStatus,
      reviewAverageNote: reviewAvg,
      recent: {
        reservations: recentReservations,
        reviews: recentReviews,
      },
    };
  }

  private async aggregateReservationsByStatus(
    userOid: Types.ObjectId,
  ): Promise<Record<string, number> | null> {
    const rows = await this.reservationModel
      .aggregate<{ _id: string; count: number }>([
        { $match: { prestataire: userOid } },
        { $group: { _id: '$statut', count: { $sum: 1 } } },
      ])
      .exec();
    if (rows.length === 0) {
      return null;
    }
    const out: Record<string, number> = {};
    for (const r of rows) {
      out[String(r._id)] = r.count;
    }
    return out;
  }

  private async aggregateReviewAverage(
    etablissementIds: Types.ObjectId[],
  ): Promise<number | null> {
    if (etablissementIds.length === 0) {
      return null;
    }
    const [row] = await this.avisModel
      .aggregate<{ avg: number | null }>([
        { $match: { etablissement: { $in: etablissementIds } } },
        { $group: { _id: null, avg: { $avg: '$note' } } },
      ])
      .exec();
    if (!row?.avg || Number.isNaN(row.avg)) {
      return null;
    }
    return Math.round(row.avg * 100) / 100;
  }

  private async recentReservations(userOid: Types.ObjectId) {
    const docs = await this.reservationModel
      .find({ prestataire: userOid })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('statut dateDebut etablissement createdAt')
      .lean()
      .exec();
    return docs.map((d) => {
      const row = d as typeof d & { createdAt?: Date };
      return {
        id: String(d._id),
        statut: d.statut,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
        dateDebut: d.dateDebut.toISOString(),
        etablissementId: String(d.etablissement),
      };
    });
  }

  private async recentReviews(etablissementIds: Types.ObjectId[]) {
    const docs = await this.avisModel
      .find({ etablissement: { $in: etablissementIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('note etablissement createdAt')
      .lean()
      .exec();
    return docs.map((d) => {
      const row = d as typeof d & { createdAt?: Date };
      return {
        id: String(d._id),
        note: d.note,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
        etablissementId: d.etablissement ? String(d.etablissement) : null,
      };
    });
  }
}
