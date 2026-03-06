import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type ViewStyle } from 'react-native';

import { Brand, Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  /** Style « contour » (texte bleu sur fond clair) */
  variant?: 'filled' | 'outline';
};

/**
 * Bouton principal réutilisable (même look sur login, welcome, etc.).
 */
export function PrimaryButton({ title, onPress, disabled, loading, style, variant = 'filled' }: Props) {
  const isDisabled = disabled || loading;
  const outline = variant === 'outline';
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        outline && styles.btnOutline,
        isDisabled && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={outline ? Colors.primary : Brand.white} />
      ) : (
        <Text style={[styles.btnText, outline && styles.btnTextOutline]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  btnOutline: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: Brand.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  btnTextOutline: {
    color: Colors.primary,
  },
});
