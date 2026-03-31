/**
 * Thème couleur — mobile e-conciergerie.
 *
 * Structure :
 * - `palette` — couleurs brutes (marque + neutres). Base pour extensions / thèmes futurs.
 * - `colors` — tokens sémantiques pour l’UI (StyleSheet, props). **À utiliser au quotidien.**
 *
 * Imports recommandés :
 * - `import { colors } from '@/src/theme/colors'` ou `from '@/src/constants/theme'`
 * - `import { palette }` uniquement pour dériver de nouvelles teintes ou un thème alternatif.
 *
 * `Colors` (PascalCase) est un alias de `colors` pour ne pas casser le code existant.
 */

// ——————————————————————————————————————————————————————————————
// 1. RAW PALETTE — références hex, pas d’usage direct dans les composants
// ——————————————————————————————————————————————————————————————

export const palette = {
  primaryDark: '#27408B',
  primaryGold: '#F4C021',
  primaryBlue: '#2F64E1',
  neutralLight: '#D9DADD',
  navyDark: '#06153A',
  slate: '#70819B',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type PaletteName = keyof typeof palette;

// ——————————————————————————————————————————————————————————————
// 2. SEMANTIC COLORS — usage UI (boutons, texte, fonds, états)
// ——————————————————————————————————————————————————————————————

export const colors = {
  // —— Actions & marque
  /** Boutons pleins, liens principaux, focus système */
  primary: palette.primaryBlue,
  /** Titres premium, en-têtes forts */
  primaryDark: palette.primaryDark,
  /** Accents dorés : onglets actifs, étoiles, badges « pro » */
  accent: palette.primaryGold,
  highlight: palette.primaryGold,

  // —— Surfaces
  /** Fond d’écran */
  background: '#EEF0F4',
  surface: palette.white,
  card: palette.white,
  surfaceSecondary: '#F4F5F7',
  surfaceMuted: '#E4E7ED',

  // —— Texte
  text: palette.navyDark,
  textMuted: palette.slate,
  textOnDark: palette.white,
  textOnPrimary: palette.white,

  // —— Bordures
  border: palette.neutralLight,
  borderLight: '#E8EAEF',

  // —— Icônes & navigation
  iconDefault: palette.slate,
  iconActive: palette.primaryGold,
  iconPrimary: palette.primaryBlue,
  tabBarActive: palette.primaryGold,
  tabBarInactive: palette.slate,

  // —— Formulaire / chips
  chipSelectedBg: 'rgba(47, 100, 225, 0.12)',
  chipSelectedBorder: palette.primaryBlue,
  chipAccentTint: 'rgba(244, 192, 33, 0.12)',
  infoSurface: '#EEF2FA',
  infoBorder: 'rgba(39, 64, 139, 0.22)',
  badgeWarmBg: '#FFFBEB',

  // —— Feedback
  error: '#DC2626',
  errorMuted: 'rgba(220, 38, 38, 0.35)',
  errorSurface: '#FEF2F2',
  errorListBg: '#fdecea',
  success: '#16A34A',
  warningBg: '#FEF3C7',
  warningBorder: '#FCD34D',

  // —— Étoiles & favoris
  star: palette.primaryGold,
  favorite: '#E11D48',

  // —— Overlays & scrims
  overlayLight: 'rgba(255, 255, 255, 0.95)',
  overlayWhiteSubtle: 'rgba(255, 255, 255, 0.14)',
  overlayWhiteBorder: 'rgba(255, 255, 255, 0.24)',
  overlayDarkSoft: 'rgba(6, 21, 58, 0.34)',
  overlayDarkMedium: 'rgba(6, 21, 58, 0.55)',
  overlayBlackSoft: 'rgba(0, 0, 0, 0.14)',
  imageOverlay: 'rgba(6, 21, 58, 0.12)',
  scrim: 'rgba(6, 21, 58, 0.45)',

  shadow: palette.navyDark,

  switchTrackOn: 'rgba(47, 100, 225, 0.42)',
  dotInactive: 'rgba(112, 129, 155, 0.45)',
  dotsTrackBg: 'rgba(6, 21, 58, 0.06)',
  primaryAlpha08: 'rgba(47, 100, 225, 0.08)',
  primaryAlpha06: 'rgba(47, 100, 225, 0.06)',
  primaryAlpha10: 'rgba(47, 100, 225, 0.1)',
  primaryBorderMuted: 'rgba(47, 100, 225, 0.35)',
  mapBarBg: 'rgba(255, 255, 255, 0.92)',
  filterResetBg: '#EEF2FA',
  ctaPillBorder: 'rgba(217, 218, 221, 0.95)',
  pinDefault: palette.slate,

  textOnImage: palette.white,
  textOnImageMuted: 'rgba(255, 255, 255, 0.88)',
  textOnImageDim: 'rgba(255, 255, 255, 0.75)',
  textBadgeOnImage: 'rgba(255, 255, 255, 0.92)',
  textShadowStrong: 'rgba(0, 0, 0, 0.45)',
  textShadowSoft: 'rgba(0, 0, 0, 0.35)',
  textShadowDim: 'rgba(0, 0, 0, 0.3)',
  textShadowLight: 'rgba(255, 255, 255, 0.9)',

  premiumIcon: '#B45309',
  premiumSurface: '#FFFBEB',
  premiumBorder: '#FDE68A',
} as const;

export type ColorName = keyof typeof colors;

/**
 * Alias PascalCase — même référence que `colors`.
 * @deprecated Préférer `colors` dans le nouveau code ; conservé pour les imports existants (`Colors.*`).
 */
export const Colors = colors;

/**
 * Raccourcis marque — dérivés de `palette` (boutons, typo sur fond coloré).
 */
export const Brand = {
  blue: palette.primaryBlue,
  navy: palette.navyDark,
  gold: palette.primaryGold,
  white: palette.white,
  graySoft: '#EEF0F4',
} as const;
