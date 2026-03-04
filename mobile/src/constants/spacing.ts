/**
 * Espacements en pixels (échelle 4 px).
 * Ex. padding: Spacing.base, marginBottom: Spacing.sm
 */
export const Spacing = {
  /** 4 */
  xs: 4,
  /** 8 */
  sm: 8,
  /** 12 */
  md: 12,
  /** 16 — valeur par défaut pour les marges d’écran */
  base: 16,
  /** 20 */
  lg: 20,
  /** 24 */
  xl: 24,
  /** 32 */
  xxl: 32,
} as const;

export type SpacingName = keyof typeof Spacing;
