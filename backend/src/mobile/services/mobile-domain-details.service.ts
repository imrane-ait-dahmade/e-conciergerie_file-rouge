import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Domaine } from '../../domaines/schemas/domaine.schema';
import { Etablissement } from '../../etablissements/schemas/etablissement.schema';
import { EtablissementService } from '../../etablissement-services/schemas/etablissement-service.schema';
import { Media } from '../../media/schemas/media.schema';
import { Service } from '../../services/schemas/service.schema';
import type { MobileDomainDetailsQueryDto } from '../dto/mobile-domain-details-query.dto';
import {
  buildItemRow,
  mapCatalogService,
  mapDomainForMobileDetails,
  type LeanDomaine,
  type LeanEtab,
  type LeanLiaison,
  type LeanService,
  type MobileDomainDetailsData,
} from '../resources/mobile-domain-details.resource';

type JoinRow = {
  liaison: LeanLiaison;
  svc: LeanService;
  etab: LeanEtab;
};

@Injectable()
export class MobileDomainDetailsService {
  constructor(
    @InjectModel(Domaine.name) private readonly domaineModel: Model<Domaine>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(EtablissementService.name)
    private readonly liaisonModel: Model<EtablissementService>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
  ) {}

  async getDomainDetails(
    domainId: string,
    query?: MobileDomainDetailsQueryDto,
  ): Promise<MobileDomainDetailsData> {
    if (!Types.ObjectId.isValid(domainId)) {
      throw new BadRequestException('Identifiant de domaine invalide');
    }

    const domainOid = new Types.ObjectId(domainId);

    const domainDoc = await this.domaineModel
      .findById(domainOid)
      .lean<LeanDomaine | null>()
      .exec();

    if (!domainDoc) {
      throw new NotFoundException('Domaine introuvable');
    }

    if (domainDoc.isActive === false) {
      throw new NotFoundException('Domaine non disponible');
    }

    const domain = mapDomainForMobileDetails(domainDoc);

    const catalogServices = await this.serviceModel
      .find({ domaine: domainOid })
      .sort({ nom: 1 })
      .lean<LeanService[]>()
      .exec();

    const services = catalogServices.map((s) =>
      mapCatalogService(s, domainId),
    );

    const serviceIds = catalogServices.map((s) => s._id);
    if (serviceIds.length === 0) {
      return { domain, services, items: [] };
    }

    const liaisons = await this.liaisonModel
      .find({
        service: { $in: serviceIds },
        isActive: { $ne: false },
      })
      .lean<LeanLiaison[]>()
      .exec();

    if (liaisons.length === 0) {
      return { domain, services, items: [] };
    }

    const etabIds = [
      ...new Set(liaisons.map((l) => l.etablissement.toString())),
    ].map((id) => new Types.ObjectId(id));

    const etabs = await this.etablissementModel
      .find({
        _id: { $in: etabIds },
        isActive: { $ne: false },
      })
      .lean<LeanEtab[]>()
      .exec();

    const etabById = new Map<string, LeanEtab>(
      etabs.map((e) => [String(e._id), e]),
    );
    const svcById = new Map<string, LeanService>(
      catalogServices.map((s) => [String(s._id), s]),
    );

    const joins: JoinRow[] = [];
    for (const liaison of liaisons) {
      const etab = etabById.get(String(liaison.etablissement));
      const svc = svcById.get(String(liaison.service));
      if (!etab || !svc) {
        continue;
      }
      joins.push({ liaison, svc, etab });
    }

    joins.sort((a, b) => {
      const fa = a.etab.isFeaturedForHomeBestProviders === true ? 1 : 0;
      const fb = b.etab.isFeaturedForHomeBestProviders === true ? 1 : 0;
      if (fb !== fa) {
        return fb - fa;
      }
      const oa =
        typeof a.etab.bestProviderSortOrder === 'number'
          ? a.etab.bestProviderSortOrder
          : 0;
      const ob =
        typeof b.etab.bestProviderSortOrder === 'number'
          ? b.etab.bestProviderSortOrder
          : 0;
      if (oa !== ob) {
        return oa - ob;
      }
      const ta = a.liaison.createdAt
        ? new Date(a.liaison.createdAt).getTime()
        : 0;
      const tb = b.liaison.createdAt
        ? new Date(b.liaison.createdAt).getTime()
        : 0;
      return tb - ta;
    });

    const liaisonIds = joins.map((j) => String(j.liaison._id));
    const covers = await this.loadCoverUrlByLiaisonId(liaisonIds);

    let items: MobileDomainDetailsData['items'] = joins.map((j) =>
      buildItemRow({
        liaison: j.liaison,
        svc: j.svc,
        etab: j.etab,
        domainId,
        coverUrl: covers.get(String(j.liaison._id)) ?? null,
      }),
    );

    const filterServiceId = query?.serviceId?.trim();
    if (filterServiceId && Types.ObjectId.isValid(filterServiceId)) {
      items = items.filter((it) => it.serviceId === filterServiceId);
    }

    return { domain, services, items };
  }

  /** Même logique que `MobileNearbyEstablishmentServicesService.loadCoverUrlByLiaisonId`. */
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
}
