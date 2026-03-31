import { useCallback, useEffect, useState } from 'react';

import { MOCK_FALLBACK_SELECTION } from '@/src/data/home.mock';
import { ApiError } from '@/src/services/api';
import { fetchFeaturedServices } from '@/src/services/featured.service';
import type { ServiceItem } from '@/src/types/home.types';

export type UseFallbackServicesResult = {
  data: ServiceItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const USE_FEATURED_API = false;

/**
 * Sélection du moment : mock stable pour le MVP.
 * Passer `USE_FEATURED_API` à true et implémenter GET /services/featured pour brancher l’API.
 */
export function useFallbackServices(): UseFallbackServicesResult {
  const [data, setData] = useState<ServiceItem[]>(() => [...MOCK_FALLBACK_SELECTION]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!USE_FEATURED_API) {
      setData([...MOCK_FALLBACK_SELECTION]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFeaturedServices();
      setData(Array.isArray(res) && res.length > 0 ? res : [...MOCK_FALLBACK_SELECTION]);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : 'Impossible de charger la sélection.';
      setError(msg);
      setData([...MOCK_FALLBACK_SELECTION]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
