import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Etablissement } from '../../etablissements/schemas/etablissement.schema';
import { EtablissementService } from '../../etablissement-services/schemas/etablissement-service.schema';
import { Domaine } from '../../domaines/schemas/domaine.schema';
import { Media } from '../../media/schemas/media.schema';
import { Service } from '../../services/schemas/service.schema';
import type { MobileNearbyGroupedRecommendationQueryDto } from '../dto/mobile-nearby-grouped-recommendation-query.dto';
import type { MobileNearbyRecommendationQueryDto } from '../dto/mobile-nearby-recommendation-query.dto';
import {
  domaineSlug,
  type MobileNearbyEstablishmentServiceResource,
  type MobileNearbyGroupedCategoryResource,
  type MobileNearbyGroupedItemResource,
  type NearbyCandidateLean,
  toMobileNearbyEstablishmentServiceResource,
  toMobileNearbyGroupedItemResource,
} from '../resources/mobile-nearby-establishment-service.resource';

const DEFAULT_MAX_DISTANCE_M = 50_000;
const DEFAULT_LIMIT = 20;
const DEFAULT_LIMIT_PER_GROUP = 5;

@Injectable()
export class MobileNearbyEstablishmentServicesService {
  private readonly collEtab: string;
  private readonly collEs: string;
  private readonly collSvc: string;
  private readonly collDom: string;

  constructor(
    @InjectModel(EtablissementService.name)
    private readonly liaisonModel: Model<EtablissementService>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
    @InjectModel(Domaine.name)
    private readonly domaineModel: Model<Domaine>,
    @InjectModel(Media.name)
    private readonly mediaModel: Model<Media>,
  ) {
    this.collEtab = this.etablissementModel.collection.collectionName;
    this.collEs = this.liaisonModel.collection.collectionName;
    this.collSvc = this.serviceModel.collection.collectionName;
    this.collDom = this.domaineModel.collection.collectionName;
  }

  async findNearby(
    query: MobileNearbyRecommendationQueryDto,
  ): Promise<MobileNearbyEstablishmentServiceResource[]> {
    const maxMeters = query.maxDistance ?? DEFAULT_MAX_DISTANCE_M;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const candidates = await this.collectNearbyCandidates(
      query.latitude,
      query.longitude,
      maxMeters,
      Math.min(500, Math.max(limit, limit * 3)),
    );
    const sliced = candidates.slice(0, limit);
    return this.mapCandidatesToResources(sliced);
  }

  async findNearbyGrouped(
    query: MobileNearbyGroupedRecommendationQueryDto,
  ): Promise<MobileNearbyGroupedCategoryResource[]> {
    const maxMeters = query.maxDistance ?? DEFAULT_MAX_DISTANCE_M;
    const perGroup = query.limitPerGroup ?? DEFAULT_LIMIT_PER_GROUP;
    const pool = Math.min(400, Math.max(80, perGroup * 40));
    const candidates = await this.collectNearbyCandidates(
      query.latitude,
      query.longitude,
      maxMeters,
      pool,
    );
    return this.groupByDomaine(candidates, perGroup);
  }

  /**
   * Deux requêtes géo : offres avec `location` indexée, puis offres sans point propre
   * sur établissements géolocalisés. Déduplication par id de liaison (distance minimale).
   */
  private async collectNearbyCandidates(
    latitude: number,
    longitude: number,
    maxMeters: number,
    poolLimit: number,
  ): Promise<NearbyCandidateLean[]> {
    const near = {
      type: 'Point' as const,
      coordinates: [longitude, latitude] as [number, number],
    };

    const fromService = await this.runServiceLocationPipeline(
      near,
      maxMeters,
      poolLimit,
    );
    const fromEstablishment = await this.runEstablishmentFallbackPipeline(
      near,
      maxMeters,
      poolLimit,
    );

    const byId = new Map<string, NearbyCandidateLean>();
    for (const row of [...fromService, ...fromEstablishment]) {
      const id = String(row._id);
      const prev = byId.get(id);
      if (!prev || row.distanceMeters < prev.distanceMeters) {
        byId.set(id, row);
      }
    }

    return [...byId.values()].sort(
      (a, b) => a.distanceMeters - b.distanceMeters,
    );
  }

  private runServiceLocationPipeline(
    near: { type: 'Point'; coordinates: [number, number] },
    maxMeters: number,
    limit: number,
  ): Promise<NearbyCandidateLean[]> {
    const pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near,
          distanceField: 'distanceMeters',
          maxDistance: maxMeters,
          spherical: true,
          query: {
            isActive: { $ne: false },
          },
        },
      },
      {
        $lookup: {
          from: this.collEtab,
          let: { eid: '$etablissement' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$eid'] },
                isActive: { $ne: false },
              },
            },
          ],
          as: 'etabArr',
        },
      },
      { $match: { etabArr: { $ne: [] } } },
      {
        $addFields: {
          etab: { $arrayElemAt: ['$etabArr', 0] },
          _geoSource: 'service',
        },
      },
      {
        $lookup: {
          from: this.collSvc,
          localField: 'service',
          foreignField: '_id',
          as: 'svcArr',
        },
      },
      { $match: { svcArr: { $ne: [] } } },
      { $addFields: { svc: { $arrayElemAt: ['$svcArr', 0] } } },
      {
        $lookup: {
          from: this.collDom,
          localField: 'svc.domaine',
          foreignField: '_id',
          as: 'domArr',
        },
      },
      {
        $addFields: {
          dom: { $arrayElemAt: ['$domArr', 0] },
        },
      },
      { $limit: limit },
      {
        $project: {
          etabArr: 0,
          svcArr: 0,
          domArr: 0,
        },
      },
    ];

    return this.liaisonModel
      .aggregate<NearbyCandidateLean>(pipeline)
      .exec();
  }

  private runEstablishmentFallbackPipeline(
    near: { type: 'Point'; coordinates: [number, number] },
    maxMeters: number,
    limit: number,
  ): Promise<NearbyCandidateLean[]> {
    const pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near,
          distanceField: 'distanceMeters',
          maxDistance: maxMeters,
          spherical: true,
          query: {
            isActive: { $ne: false },
          },
        },
      },
      {
        $lookup: {
          from: this.collEs,
          let: { etabId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$etablissement', '$$etabId'] },
                isActive: { $ne: false },
                $or: [
                  { location: { $exists: false } },
                  { location: null },
                  { 'location.coordinates': { $exists: false } },
                  {
                    $expr: {
                      $lt: [
                        { $size: { $ifNull: ['$location.coordinates', []] } },
                        2,
                      ],
                    },
                  },
                ],
              },
            },
          ],
          as: 'liaisons',
        },
      },
      { $match: { liaisons: { $ne: [] } } },
      { $unwind: { path: '$liaisons' } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$liaisons',
              {
                distanceMeters: '$distanceMeters',
                _geoSource: 'establishment',
                etab: {
                  _id: '$_id',
                  nom: '$nom',
                  adresse: '$adresse',
                  logo: '$logo',
                  coverImage: '$coverImage',
                  image: '$image',
                  averageRating: '$averageRating',
                  reviewCount: '$reviewCount',
                  location: '$location',
                  latitude: '$latitude',
                  longitude: '$longitude',
                },
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: this.collSvc,
          localField: 'service',
          foreignField: '_id',
          as: 'svcArr',
        },
      },
      { $match: { svcArr: { $ne: [] } } },
      { $addFields: { svc: { $arrayElemAt: ['$svcArr', 0] } } },
      {
        $lookup: {
          from: this.collDom,
          localField: 'svc.domaine',
          foreignField: '_id',
          as: 'domArr',
        },
      },
      {
        $addFields: {
          dom: { $arrayElemAt: ['$domArr', 0] },
        },
      },
      { $limit: limit },
      {
        $project: {
          svcArr: 0,
          domArr: 0,
        },
      },
    ];

    return this.etablissementModel
      .aggregate<NearbyCandidateLean>(pipeline)
      .exec();
  }

  private async loadCoverUrlByLiaisonId(
    liaisonIds: string[],
  ): Promise<Map<string, string | null>> {
    const map = new Map<string, string | null>();
    for (const id of liaisonIds) {
      map.set(id, null);
    }
    if (liaisonIds.length === 0) {
      return map;
    }
    const oids = liaisonIds.map((id) => new Types.ObjectId(id));
    const rows = await this.mediaModel
      .aggregate<{ _id: Types.ObjectId; url: string }>([
        {
          $match: {
            etablissementServiceId: { $in: oids },
            type: 'image',
          },
        },
        { $sort: { isPrimary: -1, createdAt: -1 } },
        {
          $group: {
            _id: '$etablissementServiceId',
            url: { $first: '$url' },
          },
        },
      ])
      .exec();
    for (const r of rows) {
      map.set(String(r._id), r.url);
    }
    return map;
  }

  private async mapCandidatesToResources(
    candidates: NearbyCandidateLean[],
  ): Promise<MobileNearbyEstablishmentServiceResource[]> {
    const ids = candidates.map((c) => String(c._id));
    const covers = await this.loadCoverUrlByLiaisonId(ids);
    const out: MobileNearbyEstablishmentServiceResource[] = [];
    for (const c of candidates) {
      const r = toMobileNearbyEstablishmentServiceResource(
        c,
        covers.get(String(c._id)) ?? null,
      );
      if (r) {
        out.push(r);
      }
    }
    return out;
  }

  private async groupByDomaine(
    candidates: NearbyCandidateLean[],
    perGroup: number,
  ): Promise<MobileNearbyGroupedCategoryResource[]> {
    type GroupAcc = {
      categoryId: string;
      categoryName: string;
      slug: string;
      icon: string | null;
      items: MobileNearbyGroupedItemResource[];
      minDistance: number;
    };

    const covers = await this.loadCoverUrlByLiaisonId(
      candidates.map((c) => String(c._id)),
    );

    const groupMap = new Map<string, GroupAcc>();

    for (const c of candidates) {
      const key = c.dom?._id ? String(c.dom._id) : '__unknown__';
      const name = c.dom?.nom?.trim() || 'Autres';
      const slug = domaineSlug(c.dom ?? undefined);
      const icon =
        c.dom?.icon !== undefined && String(c.dom.icon).trim() !== ''
          ? String(c.dom.icon).trim()
          : null;
      const r = toMobileNearbyGroupedItemResource(
        c,
        covers.get(String(c._id)) ?? null,
      );
      if (!r) {
        continue;
      }
      let g = groupMap.get(key);
      if (!g) {
        g = {
          categoryId: c.dom?._id ? String(c.dom._id) : 'unknown',
          categoryName: name,
          slug,
          icon,
          items: [],
          minDistance: Number.POSITIVE_INFINITY,
        };
        groupMap.set(key, g);
      }
      if (g.items.length >= perGroup) {
        continue;
      }
      g.items.push(r);
      g.minDistance = Math.min(g.minDistance, r.distance_meters);
    }

    const list = [...groupMap.values()].sort(
      (a, b) => a.minDistance - b.minDistance,
    );

    return list.map((g) => ({
      category: {
        id: g.categoryId,
        name: g.categoryName,
        slug: g.slug,
        icon: g.icon,
      },
      items: g.items,
    }));
  }
}
