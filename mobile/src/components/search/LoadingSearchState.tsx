import { StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/src/constants/theme';

const PLACEHOLDER_COUNT = 6;

export function LoadingSearchState() {
  return (
    <View>
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.thumb} />
          <View style={styles.body}>
            <View style={[styles.line, styles.lineWide]} />
            <View style={[styles.line, styles.lineMid]} />
            <View style={[styles.line, styles.lineNarrow]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  thumb: {
    width: 96,
    minHeight: 104,
    backgroundColor: Colors.surfaceMuted,
  },
  body: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  line: {
    height: 12,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.sm,
  },
  lineWide: {
    width: '88%',
  },
  lineMid: {
    width: '64%',
  },
  lineNarrow: {
    width: '40%',
  },
});
