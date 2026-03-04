/**
 * Rayons de bordure (coins arrondis).
 * Ex. borderRadius: Radius.md
 */
export const Radius = {
  /** Petits éléments (badges, puces) */
  sm: 8,
  /** Champs, boutons */
  md: 12,
  /** Cartes */
  lg: 14,
  /** Grandes surfaces */
  xl: 16,
} as const;

export type RadiusName = keyof typeof Radius;
