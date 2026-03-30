import { apiFetch } from '@/src/services/api';
import type { MobileDomainsApiResponse } from '@/src/types/domain.types';

/**
 * Charge les domaines pour la Home (route publique mobile).
 */
export async function fetchDomainsForHome(): Promise<MobileDomainsApiResponse> {
  return apiFetch<MobileDomainsApiResponse>('/mobile/domains', { method: 'GET' });
}

export type { MobileDomainDto, MobileDomainsApiResponse } from '@/src/types/domain.types';
