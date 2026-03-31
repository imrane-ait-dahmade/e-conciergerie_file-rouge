import { apiFetch } from '@/src/services/api';
import type { MapNearbyItem } from '@/src/types/map.types';

export type FetchMapNearbyParams = {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
  domainId?: string;
};

/**
 * GET /map/nearby — points carte + métadonnées légères pour les markers.
 * (Le filtre établissement / service s’applique côté app sur la liste renvoyée.)
 */
export async function fetchMapNearby(
  params: FetchMapNearbyParams,
): Promise<MapNearbyItem[]> {
  const q = new URLSearchParams();
  q.set('lat', String(params.lat));
  q.set('lng', String(params.lng));
  if (params.limit != null) {
    q.set('limit', String(params.limit));
  }
  if (params.radiusKm != null) {
    q.set('radiusKm', String(params.radiusKm));
  }
  if (params.domainId) {
    q.set('domainId', params.domainId);
  }
  const path = `/map/nearby?${q.toString()}`;
  return apiFetch<MapNearbyItem[]>(path, { method: 'GET' });
}
