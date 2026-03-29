import { getRoleNameFromUser } from "@/lib/permissions/user-role";
import { hrefAdmin, hrefPrestataire } from "@/lib/routes/protected-areas";

/**
 * URL après connexion réussie :
 * - `admin` → `/[locale]/admin`
 * - `prestataire` → `/[locale]/prestataire`
 * - `client` (voyageur) → accueil `/[locale]`
 *
 * `user` correspond à `AuthResponse["user"]` (voir backend `SafeUserResponse.role.name`).
 */
export function getPostLoginHref(
  locale: string,
  user?: Record<string, unknown>,
): string {
  const roleName = getRoleNameFromUser(user);
  if (roleName === "admin") return hrefAdmin(locale);
  if (roleName === "prestataire") return hrefPrestataire(locale);
  return `/${locale}`;
}
