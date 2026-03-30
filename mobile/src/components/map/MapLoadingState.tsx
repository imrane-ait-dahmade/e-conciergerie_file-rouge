import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Spacing } from '@/src/constants/theme';

type Props = {
  message?: string;
};

/**
 * Overlay de chargement au-dessus de la carte (offres ou position).
 */
export function MapLoadingState({ message = 'Chargement des offres…' }: Props) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.card}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.overlayLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
