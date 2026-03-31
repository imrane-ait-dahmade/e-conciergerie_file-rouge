import { useCallback, useEffect, useState } from 'react';

import { fetchNearbyServices } from '@/src/services/nearby.service';
import { ApiError } from '@/src/services/api';
import type { UserLocationCoords } from '@/src/types/location.types';
import type { NearbyService } from '@/src/types/nearby.types';

export type UseNearbyServicesOptions = {
  limit?: number;
  radiusKm?: number;
  domainId?: string;
};

export type UseNearbyServicesResult = {
  data: NearbyService[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function messageFromUnknown(e: unknown): string {
  if (e instanceof ApiError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return 'Impossible de charger les services à proximité.';
}

/**
 * Charge les offres proches lorsque `coords` est défini.
 */
export function useNearbyServices(
  coords: UserLocationCoords | null,
  options: UseNearbyServicesOptions = {},
): UseNearbyServicesResult {
  const { limit = 12, radiusKm = 50, domainId } = options;

  const [data, setData] = useState<NearbyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!coords) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetchNearbyServices({
        lat: coords.latitude,
        lng: coords.longitude,
        limit,
        radiusKm,
        domainId,
      });
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      setData([]);
      setError(messageFromUnknown(e));
    } finally {
      setLoading(false);
    }
  }, [coords, limit, radiusKm, domainId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
