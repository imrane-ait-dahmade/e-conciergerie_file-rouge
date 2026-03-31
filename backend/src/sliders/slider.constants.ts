/**
 * Champs autorisés lors des opérations create/update côté service (équivalent Laravel `$fillable`).
 * À utiliser pour construire les objets passés à `create()` / `findByIdAndUpdate()` et éviter
 * d’écrire des champs non prévus.
 */
export const SLIDER_FILLABLE_FIELDS = [
  'title',
  'description',
  'badge',
  'picture',
  'color',
  'isActive',
  'sortOrder',
  'buttonText',
  'buttonLink',
  'startsAt',
  'endsAt',
] as const;

export type SliderFillableField = (typeof SLIDER_FILLABLE_FIELDS)[number];
