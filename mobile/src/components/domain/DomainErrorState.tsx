import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';

export type DomainErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function DomainErrorState({ message, onRetry }: DomainErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.error}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Réessayer"
        >
          <Text style={styles.btnLabel}>Réessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    gap: Spacing.md,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    lineHeight: LineHeight.relaxed,
  },
  btn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  btnLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
