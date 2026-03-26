"use client";

/**
 * Droits d’affichage du menu admin — à brancher sur auth / rôles.
 */
export function useAdminSidebarAccess() {
  return {
    canViewDashboard: true,
    canViewLocation: true,
    canViewUsers: true,
    canViewReservations: true,
    canViewServices: true,
    canViewSettings: true,
  };
}
