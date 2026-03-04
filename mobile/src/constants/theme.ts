/**
 * Point d’entrée du design system mobile.
 * Importe depuis ici dans les écrans : couleurs, espacements, rayons, typo.
 */
export { Brand, Colors } from '@/src/constants/colors';
export { Spacing } from '@/src/constants/spacing';
export { Radius } from '@/src/constants/radius';
export { FontSize, LineHeight } from '@/src/constants/typography';

/**
 * @deprecated Préférer `Colors` — conservé pour ne pas casser les imports existants.
 * Les clés sont identiques à `Colors`.
 */
export { Colors as AppColors } from '@/src/constants/colors';
