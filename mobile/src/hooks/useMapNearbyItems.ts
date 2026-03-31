import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/src/services/api';
import { fetchMapNearby } from '@/src/services/map.service';
import type { MapNearbyItem } from '@/src/types/map.types';
import type { UserLocationCoords } from '@/src/types/location.types';

export type UseMapNearbyItemsParams = {
  coords: UserLocationCoords | null;
  radiusKm: number;
  domainId?: string;
  limit?: number;
};

export type UseMapNearbyItemsResult = {
  items: MapNearbyItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function messageFromUnknown(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Impossible de charger les offres à proximité.';
}

/**
 * Charge les points carte (GET /map/nearby) lorsque `coords` est défini.
 */
export function useMapNearbyItems({
  coords,
  radiusKm,
  domainId,
  limit = 60,
}: UseMapNearbyItemsParams): UseMapNearbyItemsResult {
  const [items, setItems] = useState<MapNearbyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!coords) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetchMapNearby({
        lat: coords.latitude,
        lng: coords.longitude,
        radiusKm,
        domainId,
        limit,
      });
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      setItems([]);
      setError(messageFromUnknown(e));
    } finally {
      setLoading(false);
    }
  }, [coords, domainId, limit, radiusKm]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}
