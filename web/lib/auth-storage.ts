/**
 * Stockage du jeton d’accès (temporaire : localStorage).
 * Plus tard : cookies httpOnly ou session côté serveur pour plus de sécurité.
 *
 * Le profil minimal (`authUser`) sert au **UX** (rôles, menu, redirections).
 * La sécurité réelle reste côté API (JWT + guards).
 */
import type { RoleName } from "@/lib/permissions/roles";
import { getRoleNameFromUser } from "@/lib/permissions/user-role";

export const ACCESS_TOKEN_KEY = "accessToken";
export const AUTH_USER_KEY = "authUser";

export type StoredAuthUser = {
  roleName: RoleName;
  email?: string;
};

export function saveAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** Enregistre le rôle (et champs utiles) après login / refresh manuel. */
export function saveAuthUser(user: Record<string, unknown>): void {
  const roleName = getRoleNameFromUser(user);
  if (!roleName) return;
  const payload: StoredAuthUser = {
    roleName,
    email: typeof user.email === "string" ? user.email : undefined,
  };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload));
}

export function getStoredAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const roleName = (parsed as { roleName?: unknown }).roleName;
    if (roleName !== "admin" && roleName !== "prestataire" && roleName !== "client") {
      return null;
    }
    return parsed as StoredAuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
