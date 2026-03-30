import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';

/**
 * Placeholder MVP — carte / géolocalisation (ex. react-native-maps plus tard).
 */
export function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carte</Text>
      <Text style={styles.body}>
        La carte interactive et la géolocalisation seront branchées ici (ex. carte des offres à
        proximité).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    lineHeight: LineHeight.relaxed,
  },
});
