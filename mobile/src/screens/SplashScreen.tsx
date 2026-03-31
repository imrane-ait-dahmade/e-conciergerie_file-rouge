import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Spacing } from '@/src/constants/theme';

/**
 * Affiché pendant la lecture du token dans AsyncStorage (avant de choisir Auth ou App).
 * Pas d’écran de navigation : simple vue d’attente.
 */
export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E‑Conciergerie</Text>
      <Text style={styles.subtitle}>Chargement…</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },
  spinner: {
    marginTop: Spacing.sm,
  },
});
