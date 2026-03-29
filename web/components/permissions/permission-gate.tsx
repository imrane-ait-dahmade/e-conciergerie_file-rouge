"use client";

import type { ReactNode } from "react";

import { usePermissions, type UsePermissionsResult } from "@/hooks/use-permissions";
import type { PermissionFlags } from "@/lib/permissions/permissions";

type PermissionKey = keyof PermissionFlags;

type PermissionGateProps = {
  /** Une ou plusieurs permissions : toutes doivent être vraies (ET). */
  when: PermissionKey | readonly PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
};

function checkKeys(
  perms: Pick<UsePermissionsResult, PermissionKey>,
  keys: readonly PermissionKey[],
): boolean {
  return keys.every((k) => perms[k]);
}

/**
 * Affiche `children` seulement si les permissions indiquées sont satisfaites.
 *
 * @example
 * <PermissionGate when="canManageUsers">
 *   <Button>Ajouter un utilisateur</Button>
 * </PermissionGate>
 */
export function PermissionGate({ when, children, fallback = null }: PermissionGateProps) {
  const perms = usePermissions();
  const keys = (Array.isArray(when) ? when : [when]) as PermissionKey[];

  if (!perms.hydrated) return null;
  if (!checkKeys(perms, keys)) return fallback;

  return children;
}
