import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiError } from '@/src/services/api';
import { fetchDomainDetail } from '@/src/services/domain.service';
import type {
  DomainDetailResponse,
  DomainEstablishmentServiceItem,
  DomainItem,
  DomainServiceItem,
} from '@/src/types/domain.types';

export type UseDomainDetailOptions = {
  /** Libellé affiché dans le mock si `EXPO_PUBLIC_DOMAIN_DETAIL_MOCK=1` */
  mockName?: string;
  mockSlug?: string;
};

export type UseDomainDetailResult = {
  domain: DomainItem | null;
  services: DomainServiceItem[];
  allItems: DomainEstablishmentServiceItem[];
  filteredItems: DomainEstablishmentServiceItem[];
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string) => void;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Vrai si le domaine n’a aucun sous-service renvoyé par l’API */
  hasNoServices: boolean;
};

/**
 * Charge le bundle domaine + sous-services + cartes, puis filtre les cartes
 * selon l’onglet sous-service actif (premier sélectionné par défaut).
 */
export function useDomainDetail(
  domainId: string,
  options?: UseDomainDetailOptions,
): UseDomainDetailResult {
  const [bundle, setBundle] = useState<DomainDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!domainId) {
      setError('Identifiant de domaine manquant.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchDomainDetail(domainId, {
      mockName: options?.mockName,
      mockSlug: options?.mockSlug,
    })
      .then((res) => {
        setBundle(res.data);
      })
      .catch((e: unknown) => {
        const msg =
          e instanceof ApiError
            ? e.message
            : 'Impossible de charger ce domaine. Vérifiez la connexion.';
        setError(msg);
        setBundle(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [domainId, options?.mockName, options?.mockSlug]);

  useEffect(() => {
    load();
  }, [load]);

  /** Référence stable tant que `bundle` est inchangé (évite `[]` neuf à chaque rendu → boucle useEffect). */
  const services = useMemo<DomainServiceItem[]>(
    () => bundle?.services ?? [],
    [bundle],
  );
  const allItems = useMemo<DomainEstablishmentServiceItem[]>(
    () => bundle?.items ?? [],
    [bundle],
  );
  const domain = bundle?.domain ?? null;

  useEffect(() => {
    if (services.length === 0) {
      setSelectedServiceId(null);
      return;
    }
    setSelectedServiceId((prev) => {
      if (prev && services.some((s) => s.id === prev)) {
        return prev;
      }
      return services[0].id;
    });
  }, [services]);

  const filteredItems = useMemo(() => {
    if (allItems.length === 0) {
      return [];
    }
    if (services.length === 0 || selectedServiceId == null) {
      return allItems;
    }
    return allItems.filter((it) => it.serviceId === selectedServiceId);
  }, [allItems, services.length, selectedServiceId]);

  const hasNoServices = services.length === 0;

  return {
    domain,
    services,
    allItems,
    filteredItems,
    selectedServiceId,
    setSelectedServiceId,
    loading,
    error,
    refetch: load,
    hasNoServices,
  };
}
