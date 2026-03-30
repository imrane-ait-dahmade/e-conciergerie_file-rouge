import { DOMAIN_DETAIL_USE_MOCK } from '@/src/constants/config';
import { getMockDomainDetail } from '@/src/data/domain-detail.mock';
import { apiFetch } from '@/src/services/api';
import type {
  MobileDomainDetailApiResponse,
  MobileDomainsApiResponse,
} from '@/src/types/domain.types';

/**
 * Charge les domaines pour la Home (route publique mobile).
 */
export async function fetchDomainsForHome(): Promise<MobileDomainsApiResponse> {
  return apiFetch<MobileDomainsApiResponse>('/mobile/domains', { method: 'GET' });
}

/**
 * Détail d’un domaine : sous-services + offres / établissements.
 *
 * **Backend attendu (MVP)** — Option C, un endpoint agrégé :
 * `GET /mobile/domains/:domainId/details`
 *
 * Enveloppe : `{ success, message, data: { domain, services, items } }`.
 *
 * Variantes possibles sans changer l’UI : implémenter côté BFF les routes
 * Option A/B puis les fusionner dans ce service avant de retourner le même
 * `DomainDetailResponse`.
 */
export async function fetchDomainDetail(
  domainId: string,
  options?: { mockName?: string; mockSlug?: string },
): Promise<MobileDomainDetailApiResponse> {
  if (DOMAIN_DETAIL_USE_MOCK) {
    return {
      success: true,
      message: 'mock',
      data: getMockDomainDetail(domainId, {
        name: options?.mockName,
        slug: options?.mockSlug,
      }),
    };
  }

  return apiFetch<MobileDomainDetailApiResponse>(
    `/mobile/domains/${encodeURIComponent(domainId)}/details`,
    { method: 'GET' },
  );
}

export type {
  MobileDomainDto,
  MobileDomainsApiResponse,
  DomainDetailResponse,
  DomainItem,
  DomainServiceItem,
  DomainEstablishmentServiceItem,
} from '@/src/types/domain.types';
