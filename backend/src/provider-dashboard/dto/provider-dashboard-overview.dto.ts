/**
 * Réponse GET /provider/dashboard/overview — structure stable pour le front.
 * Les champs optionnels restent absents si la donnée n’est pas calculable.
 */
export type ProviderDashboardOverviewResponse = {
  generatedAt: string;
  counts: {
    establishmentsTotal: number;
    establishmentsActive: number;
    /** Offres (liaisons catalogue) rattachées à au moins un établissement actif du prestataire. */
    establishmentServicesOnActiveEstablishments: number;
    /** Lignes libellé/valeur sur les offres des établissements du prestataire. */
    caracteristiqueAssignments: number;
    reservationsTotal: number;
    /** Avis dont l’établissement cible est un des vôtres (champ `etablissement` renseigné). */
    reviewsTotal: number;
  };
  /** Répartition des réservations (prestataire = vous), si au moins une réservation. */
  reservationsByStatus: Record<string, number> | null;
  /** Moyenne des notes (1–5) sur les avis liés à vos établissements, ou null si aucun avis. */
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
