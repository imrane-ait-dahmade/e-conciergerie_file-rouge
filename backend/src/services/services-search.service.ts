import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Domaine } from '../domaines/schemas/domaine.schema';
import { EtablissementService } from '../etablissement-services/schemas/etablissement-service.schema';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { Media } from '../media/schemas/media.schema';
import { Ville } from '../villes/schemas/ville.schema';
import {
  ServicesSearchQueryDto,
  ServicesSearchSort,
} from './dto/services-search-query.dto';
import { Service } from './schemas/service.schema';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const CURRENCY = 'MAD';

type SearchRawRow = {
  _id: Types.ObjectId | string;
  prix?: number;
  location_label?: string;
  commentaire?: string;
  createdAt?: Date;
  etab?: {
    _id: Types.ObjectId | string;
    nom?: string;
    adresse?: string;
    averageRating?: number;
  };
  svc?: {
    _id: Types.ObjectId | string;
    nom?: string;
    domaine?: Types.ObjectId | string;
  };
  dom?: {
    _id: Types.ObjectId | string;
    nom?: string;
  };
  cityDoc?: {
    _id: Types.ObjectId | string;
    nom?: string;
  };
};

type SearchResultItem = {
  id: string;
  title: string;
  image: string | null;
  locationLabel: string;
  rating: number | null;
  priceLabel: string | null;
  domain: { id: string; name: string } | null;
  establishmentName: string;
};

type SearchResponse = {
  items: SearchResultItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

@Injectable()
export class ServicesSearchService {
  private readonly collEtab: string;
  private readonly collSvc: string;
  private readonly collDom: string;
  private readonly collVille: string;

  constructor(
    @InjectModel(EtablissementService.name)
    private readonly liaisonModel: Model<EtablissementService>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
    @InjectModel(Domaine.name)
    private readonly domaineModel: Model<Domaine>,
    @InjectModel(Ville.name)
    private readonly villeModel: Model<Ville>,
    @InjectModel(Media.name)
    private readonly mediaModel: Model<Media>,
  ) {
    this.collEtab = this.etablissementModel.collection.collectionName;
    this.collSvc = this.serviceModel.collection.collectionName;
    this.collDom = this.domaineModel.collection.collectionName;
    this.collVille = this.villeModel.collection.collectionName;
  }

  async search(query: ServicesSearchQueryDto): Promise<SearchResponse> {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      throw new BadRequestException(
        'minPrice doit être inférieur ou égal à maxPrice',
      );
    }

    const page = query.page && query.page > 0 ? query.page : DEFAULT_PAGE;
    const limit = Math.min(
      query.limit && query.limit > 0 ? query.limit : DEFAULT_LIMIT,
      MAX_LIMIT,
    );
    const skip = (page - 1) * limit;

    const pipeline = this.buildPipeline(query);
    const sortStage = this.buildSortStage(query.sort);
    const facetPipeline: PipelineStage[] = [
      ...pipeline,
      {
        $facet: {
          items: [
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                prix: 1,
                location_label: 1,
                commentaire: 1,
                etab: {
                  _id: '$etab._id',
                  nom: '$etab.nom',
                  adresse: '$etab.adresse',
                  averageRating: '$etab.averageRating',
                },
                svc: {
                  _id: '$svc._id',
                  nom: '$svc.nom',
                },
                dom: {
                  _id: '$dom._id',
                  nom: '$dom.nom',
                },
                cityDoc: {
                  _id: '$cityDoc._id',
                  nom: '$cityDoc.nom',
                },
              },
            },
          ],
          meta: [{ $count: 'total' }],
        },
      },
    ];

    const [agg] = await this.liaisonModel
      .aggregate<{ items: SearchRawRow[]; meta: Array<{ total: number }> }>(
        facetPipeline,
      )
      .exec();

    const rows = agg?.items ?? [];
    const total = agg?.meta?.[0]?.total ?? 0;
    const coverByLiaisonId = await this.loadCoverByLiaisonId(
      rows.map((r) => String(r._id)),
    );

    const items = rows.map((row) => this.toResultItem(row, coverByLiaisonId));
    return {
      items,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  }

  private buildPipeline(query: ServicesSearchQueryDto): PipelineStage[] {
    const pipeline: PipelineStage[] = [];
    const liaisonMatch: Record<string, unknown> = {
      isActive: { $ne: false },
    };
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      liaisonMatch.prix = {};
      if (query.minPrice !== undefined) {
        (liaisonMatch.prix as Record<string, unknown>).$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        (liaisonMatch.prix as Record<string, unknown>).$lte = query.maxPrice;
      }
    }
    pipeline.push({ $match: liaisonMatch });

    const etabMatch: Record<string, unknown> = {
      isActive: { $ne: false },
    };
    if (query.cityId) {
      etabMatch.ville = new Types.ObjectId(query.cityId);
    }
    pipeline.push({
      $lookup: {
        from: this.collEtab,
        let: { eid: '$etablissement' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$eid'] },
              ...etabMatch,
            },
          },
        ],
        as: 'etabArr',
      },
    });
    pipeline.push({ $match: { etabArr: { $ne: [] } } });
    pipeline.push({ $addFields: { etab: { $arrayElemAt: ['$etabArr', 0] } } });

    pipeline.push({
      $lookup: {
        from: this.collSvc,
        localField: 'service',
        foreignField: '_id',
        as: 'svcArr',
      },
    });
    pipeline.push({ $match: { svcArr: { $ne: [] } } });
    pipeline.push({ $addFields: { svc: { $arrayElemAt: ['$svcArr', 0] } } });

    if (query.domainId) {
      pipeline.push({
        $match: { 'svc.domaine': new Types.ObjectId(query.domainId) },
      });
    }

    pipeline.push({
      $lookup: {
        from: this.collDom,
        localField: 'svc.domaine',
        foreignField: '_id',
        as: 'domArr',
      },
    });
    pipeline.push({ $addFields: { dom: { $arrayElemAt: ['$domArr', 0] } } });

    pipeline.push({
      $lookup: {
        from: this.collVille,
        localField: 'etab.ville',
        foreignField: '_id',
        as: 'cityArr',
      },
    });
    pipeline.push({
      $addFields: { cityDoc: { $arrayElemAt: ['$cityArr', 0] } },
    });

    if (query.city?.trim()) {
      pipeline.push({
        $match: {
          'cityDoc.nom': {
            $regex: this.escapeRegex(query.city.trim()),
            $options: 'i',
          },
        },
      });
    }

    if (query.minRating !== undefined) {
      pipeline.push({
        $match: {
          'etab.averageRating': { $gte: query.minRating },
        },
      });
    }

    if (query.q?.trim()) {
      const safe = this.escapeRegex(query.q.trim());
      pipeline.push({
        $match: {
          $or: [
            { 'svc.nom': { $regex: safe, $options: 'i' } },
            { 'svc.description': { $regex: safe, $options: 'i' } },
            { 'etab.nom': { $regex: safe, $options: 'i' } },
            { 'etab.adresse': { $regex: safe, $options: 'i' } },
            { commentaire: { $regex: safe, $options: 'i' } },
            { location_label: { $regex: safe, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({
      $project: {
        etabArr: 0,
        svcArr: 0,
        domArr: 0,
        cityArr: 0,
      },
    });

    return pipeline;
  }

  private buildSortStage(
    sort: ServicesSearchSort | undefined,
  ): Record<string, 1 | -1> {
    if (sort === ServicesSearchSort.RATING_DESC) {
      return { 'etab.averageRating': -1, createdAt: -1 };
    }
    if (sort === ServicesSearchSort.PRICE_ASC) {
      return { prix: 1, createdAt: -1 };
    }
    if (sort === ServicesSearchSort.PRICE_DESC) {
      return { prix: -1, createdAt: -1 };
    }
    return { createdAt: -1 };
  }

  private async loadCoverByLiaisonId(
    liaisonIds: string[],
  ): Promise<Map<string, string | null>> {
    const out = new Map<string, string | null>();
    for (const id of liaisonIds) out.set(id, null);
    if (liaisonIds.length === 0) {
      return out;
    }
    const objectIds = liaisonIds.map((id) => new Types.ObjectId(id));
    const rows = await this.mediaModel
      .aggregate<{ _id: Types.ObjectId; url: string }>([
        {
          $match: {
            etablissementServiceId: { $in: objectIds },
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
    for (const row of rows) {
      out.set(String(row._id), row.url);
    }
    return out;
  }

  private toResultItem(
    row: SearchRawRow,
    coverByLiaisonId: Map<string, string | null>,
  ): SearchResultItem {
    const liaisonId = String(row._id);
    const image = coverByLiaisonId.get(liaisonId) ?? null;
    const locationLabel =
      row.cityDoc?.nom?.trim() ||
      row.location_label?.trim() ||
      row.etab?.adresse?.trim() ||
      '';
    const priceLabel =
      typeof row.prix === 'number' && !Number.isNaN(row.prix)
        ? `À partir de ${Math.round(row.prix)} ${CURRENCY}`
        : null;

    return {
      id: liaisonId,
      title: row.svc?.nom?.trim() || 'Service',
      image,
      locationLabel,
      rating:
        typeof row.etab?.averageRating === 'number'
          ? row.etab.averageRating
          : null,
      priceLabel,
      domain:
        row.dom?._id && row.dom.nom
          ? { id: String(row.dom._id), name: row.dom.nom.trim() }
          : null,
      establishmentName: row.etab?.nom?.trim() || '',
    };
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
