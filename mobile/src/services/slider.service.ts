import { apiFetch } from '@/src/services/api';
import type { MobileHeroSlidersResponse } from '@/src/types/slider.types';

const HERO_SLIDERS_PATH = '/mobile/hero/sliders';

/**
 * Slides du carrousel hero (Home). Public, sans JWT.
 *
 * Pour changer l’URL : modifier `HERO_SLIDERS_PATH` ou centraliser les chemins
 * dans un fichier `constants/apiPaths.ts` si le projet grossit.
 */
export async function fetchHeroSliders(limit = 15): Promise<MobileHeroSlidersResponse> {
  const q = new URLSearchParams();
  q.set('limit', String(Math.min(Math.max(limit, 1), 30)));
  return apiFetch<MobileHeroSlidersResponse>(`${HERO_SLIDERS_PATH}?${q.toString()}`, {
    method: 'GET',
  });
}
