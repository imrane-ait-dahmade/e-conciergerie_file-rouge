import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/src/services/api';
import { fetchDomainsForHome } from '@/src/services/domain.service';
import type { DomainBarItem, MobileDomainDto } from '@/src/types/domain.types';

function toDomainBarItems(rows: MobileDomainDto[]): DomainBarItem[] {
  return rows
    .filter((d) => d.isActive !== false)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name, 'fr');
    })
    .map((d) => ({
      id: d.id,
      label: d.name,
      iconKey: d.icon ?? '',
      slug: d.slug,
    }));
}

export type UseMobileDomainsResult = {
  domains: DomainBarItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Charge les domaines Home au montage. Utiliser `domains` + `selectedDomainId` pour filtrer le contenu plus tard.
 */
export function useMobileDomains(): UseMobileDomainsResult {
  const [domains, setDomains] = useState<DomainBarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchDomainsForHome()
      .then((res) => {
        setDomains(toDomainBarItems(res.data ?? []));
      })
      .catch((e: unknown) => {
        const msg =
          e instanceof ApiError
            ? e.message
            : 'Impossible de charger les domaines. Vérifiez la connexion.';
        setError(msg);
        setDomains([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    domains,
    loading,
    error,
    refetch: load,
  };
}
