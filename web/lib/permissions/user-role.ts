import type { RoleName } from "./roles";

/**
 * Extrait le nom de rôle depuis la réponse API `user` (ex. après login).
 */
export function getRoleNameFromUser(user: unknown): RoleName | null {
  if (!user || typeof user !== "object") return null;
  const role = (user as { role?: unknown }).role;
  if (!role || typeof role !== "object") return null;
  const name = (role as { name?: unknown }).name;
  if (name === "admin" || name === "prestataire" || name === "client") {
    return name;
  }
  return null;
}

export function isRoleAllowed(
  role: RoleName | null,
  allowed: readonly RoleName[],
): boolean {
  if (!role) return false;
  return allowed.includes(role);
}
