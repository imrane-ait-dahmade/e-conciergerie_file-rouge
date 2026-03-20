import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/src/constants/theme';

/**
 * Affiché pendant la lecture du token dans AsyncStorage (avant de choisir Auth ou App).
 * Pas d’écran de navigation : simple vue d’attente.
 */
export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E‑Conciergerie</Text>
      <Text style={styles.subtitle}>Chargement…</Text>
      <ActivityIndicator size="large" color={AppColors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textMuted,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
