/**
 * Noms de rôles alignés sur le backend (`roles.name` en MongoDB).
 * Le « voyageur » correspond au rôle technique `client`.
 */
export type RoleName = "admin" | "prestataire" | "client";

export const RoleName = {
  Admin: "admin",
  Prestataire: "prestataire",
  /** Voyageur — stocké en base sous le nom `client`. */
  Voyageur: "client",
} as const;
