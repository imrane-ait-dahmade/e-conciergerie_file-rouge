import type { ProviderDashboardOverview } from "@/lib/types/provider-dashboard-overview";

/** Données de démo si l’API est indisponible ou sans token. */
export const MOCK_PROVIDER_DASHBOARD_OVERVIEW: ProviderDashboardOverview = {
  generatedAt: new Date().toISOString(),
  counts: {
    establishmentsTotal: 3,
    establishmentsActive: 2,
    establishmentServicesOnActiveEstablishments: 8,
    caracteristiqueAssignments: 24,
    reservationsTotal: 12,
    reviewsTotal: 9,
  },
  reservationsByStatus: {
    demandee: 2,
    confirmee: 5,
    annulee: 1,
    terminee: 4,
  },
  reviewAverageNote: 4.42,
  recent: {
    reservations: [
      {
        id: "mock-r1",
        statut: "confirmee",
        createdAt: new Date().toISOString(),
        dateDebut: new Date().toISOString(),
        etablissementId: "mock-e1",
      },
      {
        id: "mock-r2",
        statut: "demandee",
        createdAt: new Date().toISOString(),
        dateDebut: new Date().toISOString(),
        etablissementId: "mock-e2",
      },
    ],
    reviews: [
      {
        id: "mock-a1",
        note: 5,
        createdAt: new Date().toISOString(),
        etablissementId: "mock-e1",
      },
    ],
  },
};
