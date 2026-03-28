import type { ProviderStatisticsExtras } from "@/lib/types/provider-statistics";

/**
 * Données d’illustration pour la page Statistiques (graphiques / top services).
 * Remplacer par une réponse API quand `GET /provider/dashboard/...` les exposera.
 */
export const MOCK_PROVIDER_STATISTICS_EXTRAS: ProviderStatisticsExtras = {
  monthlyReservationTrend: [3, 5, 4, 8, 6, 7],
  topServices: [
    { serviceName: "Chambre double", count: 28 },
    { serviceName: "Navette aéroport", count: 19 },
    { serviceName: "Petit-déjeuner", count: 14 },
  ],
};
