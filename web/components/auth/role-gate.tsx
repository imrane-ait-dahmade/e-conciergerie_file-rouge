"use client";

import type { ReactNode } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import type { RoleName } from "@/lib/permissions/roles";
import { isRoleAllowed } from "@/lib/permissions/user-role";

type RoleGateProps = {
  /** Afficher `children` seulement si le rôle est dans cette liste. */
  allow: readonly RoleName[];
  children: ReactNode;
  /** Contenu si non autorisé (par défaut : rien). */
  fallback?: ReactNode;
};

/**
 * Masque des boutons ou actions selon le **rôle brut** (liste de rôles).
 * Pour les règles métier nommées (`canManageUsers`, etc.), préférez `PermissionGate` + `usePermissions()`.
 *
 * @example
 * <RoleGate allow={[RoleName.Admin]}>
 *   <Button>Supprimer</Button>
 * </RoleGate>
 */
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { role, hydrated } = useAuthSession();

  if (!hydrated) return null;
  if (!role || !isRoleAllowed(role, allow)) return fallback;

  return children;
}
