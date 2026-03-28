/**
 * Aligné sur GET /provider/dashboard/overview (NestJS).
 * Utiliser ce type quand tu branches le fetch réel.
 */
export type ProviderDashboardOverview = {
  generatedAt: string;
  counts: {
    establishmentsTotal: number;
    establishmentsActive: number;
    establishmentServicesOnActiveEstablishments: number;
    caracteristiqueAssignments: number;
    reservationsTotal: number;
    reviewsTotal: number;
  };
  reservationsByStatus: Record<string, number> | null;
  reviewAverageNote: number | null;
  recent: {
    reservations: Array<{
      id: string;
      statut: string;
      createdAt: string | null;
      dateDebut: string;
      etablissementId: string;
    }>;
    reviews: Array<{
      id: string;
      note: number;
      createdAt: string | null;
      etablissementId: string | null;
    }>;
  };
};
