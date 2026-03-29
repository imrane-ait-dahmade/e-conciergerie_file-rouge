"use client";

import { useCallback, useEffect, useState } from "react";

import { getAccessToken, getStoredAuthUser } from "@/lib/auth-storage";
import type { RoleName } from "@/lib/permissions/roles";

/**
 * Session « légère » côté client : token + rôle stockés au login.
 * Utilisé pour l’UX uniquement (menus, redirections, masquage de boutons).
 */
export function useAuthSession() {
  const [role, setRole] = useState<RoleName | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    const stored = getStoredAuthUser();
    const token = getAccessToken();
    if (!token || !stored) {
      setRole(null);
      return;
    }
    setRole(stored.roleName);
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "authUser") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const isAuthenticated =
    hydrated && !!getAccessToken() && !!role;

  return {
    role,
    hydrated,
    isAuthenticated,
    refresh,
  };
}
