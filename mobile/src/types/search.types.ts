export type SearchEntityType = 'service' | 'establishment';

export type SearchSortOption = 'relevance' | 'rating_desc' | 'price_asc' | 'price_desc';

export type SearchFilterState = {
  domainId?: string;
  city?: string;
  minRating?: number;
};

export type SearchQueryParams = SearchFilterState & {
  q: string;
  sort?: SearchSortOption;
  page?: number;
  limit?: number;
};

export type SearchResultItem = {
  id: string;
  type: SearchEntityType;
  title: string;
  image?: string | null;
  locationLabel: string;
  rating?: number | null;
  priceLabel?: string | null;
  domain?: string;
  establishmentName?: string;
  isActive?: boolean;
};

export type SearchResponse = {
  items: SearchResultItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sort: SearchSortOption;
  appliedFilters: SearchFilterState;
};
