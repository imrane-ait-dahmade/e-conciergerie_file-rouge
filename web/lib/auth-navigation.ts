/**
 * Cible après connexion réussie.
 * - `dashboard` → `/[locale]/dashboard` (page « Tableau de bord » utilisateur)
 * - `admin` → `/[locale]/admin` (console admin)
 */
export type PostLoginDestination = "dashboard" | "admin";

/** Modifier cette valeur pour envoyer les utilisateurs vers la console admin après login. */
export const postLoginDestination: PostLoginDestination = "dashboard";

/**
 * URL relative post-login, selon `postLoginDestination`.
 */
export function getPostLoginHref(locale: string): string {
  if (postLoginDestination === "admin") {
    return `/${locale}/admin`;
  }
  return `/${locale}/dashboard`;
}
