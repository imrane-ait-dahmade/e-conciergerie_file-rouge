/**
 * Payload renvoyé par `GET /admin/dashboard/stats` (dashboard admin).
 */
export type AdminDashboardStatsResponse = {
  summary: {
    totalUsers: number;
    totalAdmins: number;
    totalProviders: number;
    /** Rôle technique `client` (voyageurs). */
    totalTravelers: number;
    totalDomains: number;
    totalServices: number;
    totalCharacteristics: number;
    totalEstablishments: number;
    totalEstablishmentServices: number;
    totalCities: number;
    totalDistricts: number;
    totalMedia: number;
  };
  charts: {
    usersByRole: Array<{
      role: string;
      label?: string;
      count: number;
    }>;
    establishmentsByDomain: Array<{
      domainId: string | null;
      domainName: string;
      count: number;
    }>;
    establishmentsByCity: Array<{
      cityId: string | null;
      cityName: string;
      count: number;
    }>;
    establishmentServicesByDomain: Array<{
      domainId: string | null;
      domainName: string;
      count: number;
    }>;
  };
  recent: {
    recentUsers: Array<{
      id: string;
      nom: string;
      prenom: string;
      email: string;
      isActive: boolean;
      role: { name: string; label?: string } | null;
      createdAt?: Date;
    }>;
    recentEstablishments: Array<{
      id: string;
      nom: string;
      isActive: boolean;
      ville: { id: string; nom: string } | null;
      domaine: { id: string; nom: string } | null;
      createdAt?: Date;
    }>;
    recentEstablishmentServices: Array<{
      id: string;
      isActive: boolean;
      prix: number | null;
      etablissement: { id: string; nom: string } | null;
      service: {
        id: string;
        nom: string;
        domaineId: string | null;
        domaineNom: string | null;
      } | null;
      createdAt?: Date;
    }>;
  };
  status: {
    activeEstablishments: number;
    inactiveEstablishments: number;
    /** Offres `EtablissementService` actives / inactives. */
    activeServices: number;
    inactiveServices: number;
    /** Utilisateurs rôle prestataire avec `isActive: true`. */
    activeProviders: number;
  };
};
