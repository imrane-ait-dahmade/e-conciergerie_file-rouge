/**
 * Réponse de `GET /admin/dashboard/stats` (NestJS).
 * Les dates sont des chaînes ISO après sérialisation JSON.
 */
export type AdminDashboardStats = {
  summary: {
    totalUsers: number;
    totalAdmins: number;
    totalProviders: number;
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
      createdAt?: string;
    }>;
    recentEstablishments: Array<{
      id: string;
      nom: string;
      isActive: boolean;
      ville: { id: string; nom: string } | null;
      domaine: { id: string; nom: string } | null;
      createdAt?: string;
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
      createdAt?: string;
    }>;
  };
  status: {
    activeEstablishments: number;
    inactiveEstablishments: number;
    activeServices: number;
    inactiveServices: number;
    activeProviders: number;
  };
};
