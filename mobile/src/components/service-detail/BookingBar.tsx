import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors, FontSize, Spacing } from '@/src/constants/theme';

type Props = {
  priceLabel: string;
  ctaLabel?: string;
  onPress: () => void;
};

/**
 * Barre d’action fixe en bas (prix + CTA primaire).
 */
export function BookingBar({ priceLabel, ctaLabel = 'Réserver', onPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
      <View style={styles.inner}>
        <View style={styles.priceCol}>
          <Text style={styles.priceHint}>Tarif</Text>
          <Text style={styles.price} numberOfLines={2}>
            {priceLabel}
          </Text>
        </View>
        <PrimaryButton title={ctaLabel} onPress={onPress} style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.base,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  priceCol: {
    flex: 1,
    minWidth: 0,
  },
  priceHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  btn: {
    flexGrow: 0,
    minWidth: 148,
    paddingHorizontal: Spacing.lg,
  },
});
