import { RoleName, type RoleName as RoleNameType } from "./roles";

/**
 * Fonctions pures : une seule source de vérité pour « qui peut quoi » côté UI.
 * Passez `role` depuis `useAuthSession()` ou `getRoleNameFromUser()` (API).
 *
 * La sécurité réelle reste sur le backend ; ici c’est uniquement pour l’UX.
 */

export function canAccessAdmin(role: RoleNameType | null): boolean {
  return role === RoleName.Admin;
}

export function canAccessProvider(role: RoleNameType | null): boolean {
  return role === RoleName.Prestataire;
}

/** Espace voyageur (rôle `client` en base). */
export function canAccessTravelerAccount(role: RoleNameType | null): boolean {
  return role === RoleName.Voyageur;
}

export function canManageUsers(role: RoleNameType | null): boolean {
  return role === RoleName.Admin;
}

/** Module admin : tous les établissements (pas le tableau prestataire). */
export function canManageEtablissements(role: RoleNameType | null): boolean {
  return role === RoleName.Admin;
}

/** Établissements / offres / caractéristiques liés au compte prestataire connecté. */
export function canManageOwnProviderResources(role: RoleNameType | null): boolean {
  return role === RoleName.Prestataire;
}

/** Drapeaux agrégés — utile pour les hooks et les tests. */
export type PermissionFlags = {
  canAccessAdmin: boolean;
  canAccessProvider: boolean;
  canAccessTravelerAccount: boolean;
  canManageUsers: boolean;
  canManageEtablissements: boolean;
  canManageOwnProviderResources: boolean;
};

export function getPermissions(role: RoleNameType | null): PermissionFlags {
  return {
    canAccessAdmin: canAccessAdmin(role),
    canAccessProvider: canAccessProvider(role),
    canAccessTravelerAccount: canAccessTravelerAccount(role),
    canManageUsers: canManageUsers(role),
    canManageEtablissements: canManageEtablissements(role),
    canManageOwnProviderResources: canManageOwnProviderResources(role),
  };
}
