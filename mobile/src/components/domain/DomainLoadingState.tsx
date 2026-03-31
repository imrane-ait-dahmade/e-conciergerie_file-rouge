import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';

export type DomainLoadingStateProps = {
  message?: string;
};

export function DomainLoadingState({ message = 'Chargement…' }: DomainLoadingStateProps) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
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
  text: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: LineHeight.relaxed,
  },
});
