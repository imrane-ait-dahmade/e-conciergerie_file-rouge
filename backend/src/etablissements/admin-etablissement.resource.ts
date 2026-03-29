/**
 * Normalisation légère des documents établissement côté admin (Resource / Transformer).
 * Garantit des booléens / entiers pour les champs Best providers (anciens documents).
 */
export function normalizeAdminEtablissementDoc<T extends Record<string, unknown>>(
  doc: T,
): T {
  return {
    ...doc,
    isFeaturedForHomeBestProviders: Boolean(
      doc.isFeaturedForHomeBestProviders ?? false,
    ),
    bestProviderSortOrder:
      typeof doc.bestProviderSortOrder === 'number'
        ? doc.bestProviderSortOrder
        : 0,
  } as T;
}
