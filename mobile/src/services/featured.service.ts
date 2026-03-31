import { apiFetch } from '@/src/services/api';
import type { ServiceItem } from '@/src/types/home.types';

/**
 * MVP : endpoint prévu pour la sélection Home (fallback / vedette).
 * Brancher quand le backend expose la route (ex. GET /services/featured).
 */
export async function fetchFeaturedServices(): Promise<ServiceItem[]> {
  return apiFetch<ServiceItem[]>('/services/featured', { method: 'GET' });
}
