import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/src/constants/theme';

/**
 * Accueil simple après connexion (message de projet).
 */
export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E‑Conciergerie</Text>
      <Text style={styles.subtitle}>Projet de fin d’études</Text>
      <Text style={styles.body}>
        Cette application mobile est reliée à votre API NestJS : explorez les établissements depuis
        l’onglet « Établissements » et consultez votre profil après connexion.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.primary,
    marginBottom: 20,
  },
  body: {
    fontSize: 15,
    color: AppColors.textMuted,
    lineHeight: 22,
  },
});
