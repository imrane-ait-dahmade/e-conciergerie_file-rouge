import { fetchProviderDashboardOverview } from "@/lib/api/provider-dashboard";
import { MOCK_PROVIDER_STATISTICS_EXTRAS } from "@/lib/mock/provider-statistics-extras";
import type { ProviderStatisticsExtras } from "@/lib/types/provider-statistics";
import type { ProviderDashboardOverview } from "@/lib/types/provider-dashboard-overview";

/**
 * Vue « statistiques » : réutilise l’overview prestataire + extras (mock pour l’instant).
 *
 * Pour brancher un backend dédié plus tard :
 * - ajoutez p.ex. `GET /provider/dashboard/statistics`
 * - mappez la réponse vers `ProviderStatisticsView`
 * - gardez `MOCK_PROVIDER_STATISTICS_EXTRAS` en repli si certains champs manquent
 */
export type ProviderStatisticsView = {
  overview: ProviderDashboardOverview;
  /** Graphiques / top services : mock tant que l’API ne les fournit pas */
  extras: ProviderStatisticsExtras;
};

export async function fetchProviderStatisticsView(): Promise<ProviderStatisticsView> {
  const overview = await fetchProviderDashboardOverview();
  return {
    overview,
    extras: MOCK_PROVIDER_STATISTICS_EXTRAS,
  };
}
