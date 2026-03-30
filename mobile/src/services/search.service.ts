import { MOCK_ACTIVITIES, MOCK_HOTELS, MOCK_RESTAURANTS } from '@/src/data/home.mock';
import { ApiError, apiFetch } from '@/src/services/api';
import type {
  SearchQueryParams,
  SearchResponse,
  SearchResultItem,
  SearchSortOption,
} from '@/src/types/search.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const CITY_OPTIONS = ['Marrakech', 'Casablanca', 'Rabat'] as const;

function cityFromLocation(location: string): string {
  const value = location.trim();
  if (!value) return CITY_OPTIONS[0];
  const parts = value.split(',');
  if (parts.length > 1) return parts[1].trim();
  return CITY_OPTIONS[0];
}

function parsePriceNumber(priceLabel?: string | null): number {
  if (!priceLabel) return Number.MAX_SAFE_INTEGER;
  const match = priceLabel.match(/\d+/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[0]);
}

function normalizeMockData(): SearchResultItem[] {
  const services = [...MOCK_RESTAURANTS, ...MOCK_HOTELS, ...MOCK_ACTIVITIES].map((item, idx) => ({
    id: item.id,
    type: 'service' as const,
    title: item.title,
    image: item.image,
    locationLabel: item.location,
    rating: item.rating,
    priceLabel: item.priceLabel,
    domain: idx < MOCK_RESTAURANTS.length ? 'Restauration' : idx < 6 ? 'Hébergement' : 'Activité',
    establishmentName: item.location,
    isActive: true,
  }));

  const establishments: SearchResultItem[] = [
    {
      id: 'est-1',
      type: 'establishment',
      title: 'Riad Atlas Signature',
      image: MOCK_HOTELS[0]?.image ?? null,
      locationLabel: 'Médina, Marrakech',
      rating: 4.8,
      priceLabel: null,
      domain: 'Hébergement',
      establishmentName: 'Riad Atlas Signature',
      isActive: true,
    },
    {
      id: 'est-2',
      type: 'establishment',
      title: 'Maison Gourmet Casablanca',
      image: MOCK_RESTAURANTS[0]?.image ?? null,
      locationLabel: 'Anfa, Casablanca',
      rating: 4.6,
      priceLabel: null,
      domain: 'Restauration',
      establishmentName: 'Maison Gourmet Casablanca',
      isActive: true,
    },
  ];

  return [...services, ...establishments];
}

function applySort(items: SearchResultItem[], sort: SearchSortOption): SearchResultItem[] {
  if (sort === 'rating_desc') {
    return [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  if (sort === 'price_asc') {
    return [...items].sort((a, b) => parsePriceNumber(a.priceLabel) - parsePriceNumber(b.priceLabel));
  }
  if (sort === 'price_desc') {
    return [...items].sort((a, b) => parsePriceNumber(b.priceLabel) - parsePriceNumber(a.priceLabel));
  }
  return items;
}

function runMockSearch(params: SearchQueryParams): SearchResponse {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const sort = params.sort ?? 'relevance';

  const q = params.q.trim().toLowerCase();
  let rows = normalizeMockData().filter((item) => {
    if (!q) return false;
    const haystack = [
      item.title,
      item.locationLabel,
      item.domain ?? '',
      item.establishmentName ?? '',
    ].join(' ');
    return haystack.toLowerCase().includes(q);
  });

  // Le fallback local n'a pas les IDs domaine backend. On garde ce filtre pour l'API réelle.
  if (params.city) {
    rows = rows.filter((item) => cityFromLocation(item.locationLabel) === params.city);
  }
  if (params.minRating != null) {
    rows = rows.filter((item) => (item.rating ?? 0) >= params.minRating!);
  }
  if (params.activeOnly) {
    rows = rows.filter((item) => item.isActive !== false);
  }

  rows = applySort(rows, sort);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = rows.slice(start, start + limit);

  return {
    items,
    page,
    limit,
    total,
    totalPages,
    sort,
    appliedFilters: {
      domainId: params.domainId,
      city: params.city,
      minRating: params.minRating,
      activeOnly: params.activeOnly,
    },
  };
}

/**
 * Recherche catalogue. Fallback local si l'endpoint backend n'est pas encore disponible.
 */
export async function fetchSearchResults(params: SearchQueryParams): Promise<SearchResponse> {
  const q = new URLSearchParams();
  q.set('q', params.q.trim());
  if (params.domainId) q.set('domainId', params.domainId);
  if (params.city) q.set('city', params.city);
  if (params.minRating != null) q.set('minRating', String(params.minRating));
  if (params.activeOnly != null) q.set('activeOnly', String(params.activeOnly));
  if (params.sort) q.set('sort', params.sort);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));

  try {
    return await apiFetch<SearchResponse>(`/search?${q.toString()}`, { method: 'GET' });
  } catch (error) {
    if (error instanceof ApiError && error.status !== 404) {
      throw error;
    }
    return runMockSearch(params);
  }
}
