"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthSession } from "@/hooks/use-auth-session";
import { getAccessToken } from "@/lib/auth-storage";
import type { RoleName } from "@/lib/permissions/roles";
import { isRoleAllowed } from "@/lib/permissions/user-role";

import { AuthLoading } from "./auth-loading";
import { AccessDenied } from "./access-denied";

type RequireRoleProps = {
  locale: string;
  allowedRoles: readonly RoleName[];
  children: ReactNode;
  /** Si non connecté : redirection vers la page de connexion (défaut true). */
  redirectUnauthenticatedToLogin?: boolean;
};

/**
 * Garde de route côté **client** (localStorage). Améliore l’UX ; la sécurité reste sur le backend.
 */
export function RequireRole({
  locale,
  allowedRoles,
  children,
  redirectUnauthenticatedToLogin = true,
}: RequireRoleProps) {
  const router = useRouter();
  const { role, hydrated } = useAuthSession();

  useEffect(() => {
    if (!hydrated) return;
    const token = getAccessToken();
    if (!token && redirectUnauthenticatedToLogin) {
      router.replace(`/${locale}/login`);
    }
  }, [hydrated, locale, redirectUnauthenticatedToLogin, router]);

  if (!hydrated) {
    return <AuthLoading message="Chargement…" />;
  }

  const token = getAccessToken();
  if (!token && redirectUnauthenticatedToLogin) {
    return <AuthLoading message="Redirection vers la connexion…" />;
  }

  if (!token) {
    return (
      <AccessDenied locale={locale} reason="session-required" />
    );
  }

  if (!role || !isRoleAllowed(role, allowedRoles)) {
    return (
      <AccessDenied
        locale={locale}
        reason="forbidden"
      />
    );
  }

  return children;
}
