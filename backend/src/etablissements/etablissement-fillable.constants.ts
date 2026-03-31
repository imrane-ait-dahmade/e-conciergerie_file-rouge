/**
 * Champs assignables en masse (équivalent Laravel `$fillable`) pour les flux
 * create/update — à utiliser côté services pour éviter les clés non prévues.
 *
 * Inclut la relation `ville` (et géographie) déjà présente sur le schéma.
 */
export const ETABLISSEMENT_FILLABLE_FIELDS = [
  'nom',
  'adresse',
  'latitude',
  'longitude',
  'description',
  'telephone',
  'email',
  'image',
  'logo',
  'coverImage',
  'slug',
  'averageRating',
  'reviewCount',
  'isFeaturedForHomeBestProviders',
  'bestProviderSortOrder',
  'isActive',
  'prestataire',
  'domaine',
  'pays',
  'ville',
  'quartier',
] as const;

export type EtablissementFillableField =
  (typeof ETABLISSEMENT_FILLABLE_FIELDS)[number];
