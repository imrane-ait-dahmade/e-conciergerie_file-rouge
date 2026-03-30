import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/src/services/api';
import { fetchHeroSliders } from '@/src/services/slider.service';
import type { HeroItem } from '@/src/types/home.types';
import { mapSliderApiItemsToHeroItems } from '@/src/mappers/sliderToHero.mapper';

export type UseHeroSliderResult = {
  items: HeroItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

const LIMIT = 15;

/**
 * Charge les slides hero au montage (même pattern que `useMobileDomains`).
 */
export function useHeroSlider(): UseHeroSliderResult {
  const [items, setItems] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchHeroSliders(LIMIT)
      .then((res) => {
        if (!res.success || !Array.isArray(res.data)) {
          setItems([]);
          return;
        }
        setItems(mapSliderApiItemsToHeroItems(res.data));
      })
      .catch((e: unknown) => {
        const msg =
          e instanceof ApiError
            ? e.message
            : 'Impossible de charger le carrousel. Vérifiez la connexion.';
        setError(msg);
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    loading,
    error,
    refetch: load,
  };
}
