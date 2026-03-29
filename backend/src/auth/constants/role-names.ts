import { ROLE_NAMES } from '../../roles/seeds/roles.seed';

/**
 * Noms de rôles tels qu’ils sont stockés en MongoDB (`roles.name`).
 * Utilisez ces constantes avec `@Roles(...)` pour éviter les fautes de frappe.
 *
 * Note : le voyageur correspond au rôle technique `client` en base (inscription par défaut).
 */
export const RoleName = {
  Admin: ROLE_NAMES.ADMIN,
  Prestataire: ROLE_NAMES.PRESTATAIRE,
  /** Alias métier « voyageur » → même valeur que le rôle `client` en base. */
  Voyageur: ROLE_NAMES.CLIENT,
} as const;

export type RoleNameValue = (typeof RoleName)[keyof typeof RoleName];
