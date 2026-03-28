/**
 * URL après connexion réussie :
 * - rôle `admin` → `/[locale]/admin`
 * - sinon → accueil `/[locale]`
 *
 * `user` correspond à `AuthResponse["user"]` (voir backend `SafeUserResponse.role.name`).
 */
export function getPostLoginHref(
  locale: string,
  user?: Record<string, unknown>,
): string {
  const role = user?.role;
  if (
    role &&
    typeof role === "object" &&
    "name" in role &&
    typeof (role as { name: unknown }).name === "string" &&
    (role as { name: string }).name === "admin"
  ) {
    return `/${locale}/admin`;
  }
  return `/${locale}`;
}
