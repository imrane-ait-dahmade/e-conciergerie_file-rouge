import { apiFetch } from '@/src/services/api';
import {
  mapServicesSearchResponse,
  type ServicesSearchApiResponse,
} from '@/src/mappers/searchApi.mapper';
import type { SearchQueryParams, SearchResponse } from '@/src/types/search.types';

/**
 * Recherche catalogue via `GET /services/search` (ServicesSearchService).
 * Les paramètres sont alignés sur `ServicesSearchQueryDto` (pas de `activeOnly` : rejeté par ValidationPipe).
 */
export async function fetchSearchResults(params: SearchQueryParams): Promise<SearchResponse> {
  const q = new URLSearchParams();
  q.set('q', params.q.trim());
  if (params.domainId) q.set('domainId', params.domainId);
  if (params.city) q.set('city', params.city);
  if (params.minRating != null) q.set('minRating', String(params.minRating));
  if (params.sort) q.set('sort', params.sort);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));

  const raw = await apiFetch<ServicesSearchApiResponse>(
    `/services/search?${q.toString()}`,
    { method: 'GET' },
  );
  return mapServicesSearchResponse(raw, params);
}
