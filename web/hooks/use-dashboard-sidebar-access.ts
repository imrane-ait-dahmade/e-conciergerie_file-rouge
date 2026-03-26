"use client";

/**
 * Droits d’affichage du menu dashboard — à brancher sur auth / rôles.
 */
export function useDashboardSidebarAccess() {
  return {
    canViewOverview: true,
    canViewLocation: true,
    canViewActivity: true,
    canViewReservations: true,
    canViewFavorites: true,
    canViewSettings: true,
  };
}
