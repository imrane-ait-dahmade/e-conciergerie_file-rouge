/**
 * Tailles de police (en points, comme sur le web).
 * hauteurDeLigne optionnelle pour les paragraphes (lineHeight en px).
 */
export const FontSize = {
  /** Légendes, petites notes */
  xs: 12,
  /** Sous-titres, labels de formulaire */
  sm: 14,
  /** Corps de texte par défaut */
  md: 16,
  /** Sous-titres importants */
  lg: 18,
  /** Titres de section */
  xl: 20,
  /** Grands titres d’écran */
  xxl: 24,
  /** Accroche / hero */
  display: 28,
} as const;

/**
 * Hauteurs de ligne (à associer avec fontSize du même ordre).
 */
export const LineHeight = {
  tight: 20,
  normal: 22,
  relaxed: 24,
  title: 32,
} as const;

export type FontSizeName = keyof typeof FontSize;
