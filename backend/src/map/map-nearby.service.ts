import { Injectable } from '@nestjs/common';
import type { NearbyServiceListingItem } from '../mobile/resources/mobile-nearby-establishment-service.resource';
import { ServicesNearbyService } from '../services/services-nearby.service';
import type { MapNearbyQueryDto } from './dto/map-nearby-query.dto';

export type MapNearbyItem = {
  id: string;
  /** Pin sur le siège / repli établissement vs adresse propre à l’offre. */
  type: 'establishment' | 'service';
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  locationLabel: string | null;
  image: string | null;
  rating: number | null;
  priceLabel: string | null;
  domain: { id: string; name: string } | null;
};

@Injectable()
export class MapNearbyService {
  constructor(private readonly servicesNearby: ServicesNearbyService) {}

  async findNearby(query: MapNearbyQueryDto): Promise<MapNearbyItem[]> {
    const items = await this.servicesNearby.findAll({
      lat: query.lat,
      lng: query.lng,
      limit: query.limit ?? 30,
      radiusKm: query.radiusKm,
      domainId: query.domainId,
    });
    return items.map((row) => this.toMapItem(row));
  }

  private toMapItem(item: NearbyServiceListingItem): MapNearbyItem {
    const type: MapNearbyItem['type'] =
      item.geoSource === 'establishment' ? 'establishment' : 'service';

    const subtitle =
      item.establishmentName?.trim() ||
      item.domain?.name?.trim() ||
      '';

    return {
      id: item.id,
      type,
      title: item.title,
      subtitle,
      latitude: item.latitude,
      longitude: item.longitude,
      locationLabel: item.locationLabel,
      image: item.image,
      rating: item.rating,
      priceLabel: item.priceLabel,
      domain: item.domain,
    };
  }
}
