/**
 * Point d’entrée du design system mobile.
 * Couleurs : utiliser `colors` au quotidien ; `palette` pour étendre la marque.
 */
export { Brand, Colors, colors, palette } from '@/src/theme/colors';
export type { ColorName, PaletteName } from '@/src/theme/colors';
export { Spacing } from '@/src/constants/spacing';
export { Radius } from '@/src/constants/radius';
export { FontSize, LineHeight } from '@/src/constants/typography';

/**
 * @deprecated Utiliser `colors` — alias pour anciens imports.
 */
export { colors as AppColors } from '@/src/theme/colors';
