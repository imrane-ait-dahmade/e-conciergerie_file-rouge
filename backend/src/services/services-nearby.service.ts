import { Injectable } from '@nestjs/common';
import { MobileNearbyEstablishmentServicesService } from '../mobile/services/mobile-nearby-establishment-services.service';
import type { NearbyServiceListingItem } from '../mobile/resources/mobile-nearby-establishment-service.resource';
import type { ServicesNearbyQueryDto } from './dto/services-nearby-query.dto';

const DEFAULT_LIMIT = 20;
const DEFAULT_RADIUS_KM = 50;
const MAX_RADIUS_KM = 500;
/** Si aucun résultat dans le rayon demandé, une seconde requête élargit le rayon (plafonné). */
const FALLBACK_RADIUS_MULTIPLIER = 2;

@Injectable()
export class ServicesNearbyService {
  constructor(
    private readonly mobileNearby: MobileNearbyEstablishmentServicesService,
  ) {}

  /**
   * Liste d’offres (liaison établissement × service) proches du point demandé.
   * Tableau vide si rien dans la zone ; fallback discret avec rayon élargi si pertinent.
   */
  async findAll(
    query: ServicesNearbyQueryDto,
  ): Promise<NearbyServiceListingItem[]> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const radiusKm = query.radiusKm ?? DEFAULT_RADIUS_KM;
    const maxMeters = Math.min(radiusKm * 1000, MAX_RADIUS_KM * 1000);

    const base = {
      latitude: query.lat,
      longitude: query.lng,
      limit,
      domainId: query.domainId,
    };

    let items = await this.mobileNearby.findNearbyListingItems({
      ...base,
      maxMeters,
    });

    if (
      items.length === 0 &&
      maxMeters < MAX_RADIUS_KM * 1000
    ) {
      const expanded = Math.min(
        maxMeters * FALLBACK_RADIUS_MULTIPLIER,
        MAX_RADIUS_KM * 1000,
      );
      if (expanded > maxMeters) {
        items = await this.mobileNearby.findNearbyListingItems({
          ...base,
          maxMeters: expanded,
        });
      }
    }

    return items;
  }
}
