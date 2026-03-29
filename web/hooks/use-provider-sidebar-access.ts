"use client";

import { usePermissions } from "@/hooks/use-permissions";

/**
 * Menu prestataire — aligné sur `canManageOwnProviderResources` / `canAccessProvider`.
 */
export function useProviderSidebarAccess() {
  const p = usePermissions();
  const ok = p.hydrated && p.canAccessProvider && p.canManageOwnProviderResources;

  return {
    canViewDashboard: ok,
    canViewEstablishments: ok,
    canViewEstablishmentServices: ok,
    canViewCaracteristiques: ok,
    canViewMedias: ok,
    canViewStatistics: ok,
    canViewProfile: ok,
  };
}
