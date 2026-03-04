/**
 * Palette alignée web : bleu d’accent, bleu marine foncé, blanc, gris doux.
 * Utiliser les clés « sémantiques » (primary, text, surface…) dans les écrans.
 */
export const Brand = {
  /** Bleu principal (boutons, liens, onglet actif) */
  blue: '#2563EB',
  /** Bleu marine (titres, texte principal) */
  navy: '#0F172A',
  white: '#FFFFFF',
  /** Fond de page doux */
  graySoft: '#F6F7F9',
} as const;

/**
 * Couleurs sémantiques — préférer celles-ci dans StyleSheet pour rester cohérent.
 */
export const Colors = {
  /** Alias du bleu de marque */
  primary: Brand.blue,
  /** Fond d’écran (derrière les cartes) */
  background: Brand.graySoft,
  /** Cartes, champs, surfaces « surélevées » */
  surface: Brand.white,
  /** Alias de surface (même usage que sur l’ancien thème) */
  card: Brand.white,
  /** Texte principal */
  text: Brand.navy,
  /** Sous-titres, légendes, placeholders */
  textMuted: '#64748B',
  /** Bordures légères */
  border: '#E2E8F0',
  /** États d’erreur */
  error: '#DC2626',
  /** Fond très léger (placeholder image, zones neutres) */
  surfaceMuted: '#EEF2F6',
} as const;

export type ColorName = keyof typeof Colors;
