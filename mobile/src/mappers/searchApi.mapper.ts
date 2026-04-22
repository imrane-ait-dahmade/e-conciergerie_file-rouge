import type { SearchQueryParams, SearchResponse, SearchResultItem } from '@/src/types/search.types';

/** Payload équivalent à `ServicesSearchService.search()` côté NestJS. */
export type ServicesSearchApiItem = {
  id: string;
  title: string;
  image: string | null;
  locationLabel: string;
  rating: number | null;
  priceLabel: string | null;
  domain: { id: string; name: string } | null;
  establishmentName: string;
};

export type ServicesSearchApiResponse = {
  items: ServicesSearchApiItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

function mapItem(row: ServicesSearchApiItem): SearchResultItem {
  const locationLabel =
    row.locationLabel?.trim() || row.establishmentName?.trim() || '—';

  return {
    id: row.id,
    type: 'service',
    title: row.title?.trim() || 'Service',
    image: row.image,
    locationLabel,
    rating: row.rating,
    priceLabel: row.priceLabel,
    domain: row.domain?.name,
    establishmentName: row.establishmentName,
    isActive: true,
  };
}

/**
 * Transforme la réponse `GET /services/search` vers le modèle utilisé par l’UI (types + champs dérivés).
 */
export function mapServicesSearchResponse(
  api: ServicesSearchApiResponse,
  query: SearchQueryParams,
): SearchResponse {
  const sort = query.sort ?? 'relevance';
  const limit = api.limit > 0 ? api.limit : 20;
  const totalPages = Math.max(1, Math.ceil(api.total / limit));

  return {
    items: api.items.map(mapItem),
    page: api.page,
    limit: api.limit,
    total: api.total,
    totalPages,
    sort,
    appliedFilters: {
      domainId: query.domainId,
      city: query.city,
      minRating: query.minRating,
    },
  };
}
