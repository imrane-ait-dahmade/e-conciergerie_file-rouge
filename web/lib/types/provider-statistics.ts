/**
 * Champs optionnels pour la page statistiques (hors `ProviderDashboardOverview`).
 * À aligner sur une future API dédiée si besoin.
 */
export type ProviderStatisticsExtras = {
  monthlyReservationTrend: number[];
  topServices: Array<{ serviceName: string; count: number }>;
};
