import { withEtablissementLocationApiFields } from './etablissement-api-fields.resource';

/**
 * Normalisation légère des documents établissement côté admin (Resource / Transformer).
 * Garantit des booléens / entiers pour les champs Best providers (anciens documents).
 * Ajoute `address` (alias de `adresse`) et expose `location` GeoJSON pour le front.
 */
export function normalizeAdminEtablissementDoc<T extends Record<string, unknown>>(
  doc: T,
): T {
  return {
    ...withEtablissementLocationApiFields(doc),
    isFeaturedForHomeBestProviders: Boolean(
      doc.isFeaturedForHomeBestProviders ?? false,
    ),
    bestProviderSortOrder:
      typeof doc.bestProviderSortOrder === 'number'
        ? doc.bestProviderSortOrder
        : 0,
  } as T;
}
