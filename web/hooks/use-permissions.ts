"use client";

import { useMemo } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getPermissions,
  type PermissionFlags,
} from "@/lib/permissions/permissions";

export type UsePermissionsResult = PermissionFlags & {
  role: ReturnType<typeof useAuthSession>["role"];
  hydrated: boolean;
  isAuthenticated: boolean;
};

/**
 * Tous les booléens de permission pour le composant courant, dérivés du rôle en session.
 * Préférez ceci aux comparaisons `role === 'admin'` éparpillées.
 */
export function usePermissions(): UsePermissionsResult {
  const { role, hydrated, isAuthenticated } = useAuthSession();
  const flags = useMemo(() => getPermissions(role), [role]);
  return {
    ...flags,
    role,
    hydrated,
    isAuthenticated,
  };
}
