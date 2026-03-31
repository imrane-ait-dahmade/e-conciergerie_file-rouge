import { apiFetch } from '@/src/services/api';
import type { NearbyService } from '@/src/types/nearby.types';

export type FetchNearbyParams = {
  lat: number;
  lng: number;
  limit?: number;
  radiusKm?: number;
  domainId?: string;
};

/**
 * GET /services/nearby — services géolocalisés (offres actives).
 */
export async function fetchNearbyServices(
  params: FetchNearbyParams,
): Promise<NearbyService[]> {
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
  const path = `/services/nearby?${q.toString()}`;
  return apiFetch<NearbyService[]>(path, { method: 'GET' });
}
