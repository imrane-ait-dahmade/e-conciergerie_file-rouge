/**
 * Chemins des espaces protégés sous `/[locale]/…`.
 *
 * - **Admin** : `/[locale]/admin/...`
 * - **Prestataire (fournisseur)** : URL canonique `/[locale]/prestataire/...`
 *   L’alias `/[locale]/provider/...` redirige vers `prestataire` (voir `next.config.ts`).
 */
export const PROTECTED_AREA_SEGMENT = {
  admin: "admin",
  prestataire: "prestataire",
} as const;

export function hrefAdmin(locale: string, path = ""): string {
  const suffix = path && !path.startsWith("/") ? `/${path}` : path;
  return `/${locale}/${PROTECTED_AREA_SEGMENT.admin}${suffix}`;
}

export function hrefPrestataire(locale: string, path = ""): string {
  const suffix = path && !path.startsWith("/") ? `/${path}` : path;
  return `/${locale}/${PROTECTED_AREA_SEGMENT.prestataire}${suffix}`;
}
