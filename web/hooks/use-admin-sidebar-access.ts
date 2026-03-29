"use client";

import { usePermissions } from "@/hooks/use-permissions";

/**
 * Entrées du menu admin — dérivées de `usePermissions()` (une seule logique centralisée).
 * Les routes restent protégées par `RequireRole` dans `AdminShell`.
 */
export function useAdminSidebarAccess() {
  const p = usePermissions();

  const ok = p.hydrated && p.canAccessAdmin;

  return {
    canViewDashboard: ok,
    canViewLocation: ok,
    canViewUsers: ok && p.canManageUsers,
    canViewEtablissements: ok && p.canManageEtablissements,
    canViewEtablissementServices: ok,
    canViewReservations: ok,
    canViewServices: ok,
    canViewSettings: ok,
  };
}
