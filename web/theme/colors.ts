/**
 * Palette marque (hex) — alignée app mobile.
 * Pour l’UI Tailwind/shadcn, préférer `token` / `var(--*)` depuis `globals.css`.
 */
export const palette = {
  primaryDark: '#27408B',
  primaryGold: '#F4C021',
  primaryBlue: '#2F64E1',
  neutralLight: '#D9DADD',
  navyDark: '#06153A',
  slate: '#70819B',
} as const;

/** Sémantique pratique pour composants ou écrans qui doivent rester en hex. */
export const colors = {
  background: '#EEF0F4',
  surface: '#FFFFFF',
  surfaceMuted: '#E8ECF2',
  /** Actions primaires type lien, focus, prix */
  primary: palette.primaryBlue,
  /** CTA forts, badges chauds */
  accent: palette.primaryGold,
  /** Bandeaux / titres secondaires « premium » */
  secondary: palette.primaryDark,
  textPrimary: palette.navyDark,
  textSecondary: palette.slate,
  textOnDark: '#FFFFFF',
  border: palette.neutralLight,
  iconDefault: palette.slate,
  iconActive: palette.primaryBlue,
  headerDark: palette.primaryDark,
  premiumDark: palette.navyDark,
} as const;

export type Palette = typeof palette;
export type Colors = typeof colors;
