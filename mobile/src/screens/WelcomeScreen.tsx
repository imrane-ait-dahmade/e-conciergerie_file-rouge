import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';
import type { AuthStackParamList } from '@/src/navigation/navigationTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

/**
 * Écran d’accueil avant connexion : choix entre inscription et connexion.
 */
export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue</Text>
      <Text style={styles.text}>
        Découvrez les établissements et gérez votre compte e‑conciergerie.
      </Text>
      <PrimaryButton title="Se connecter" onPress={() => navigation.navigate('Login')} style={styles.btn} />
      <PrimaryButton
        title="Créer un compte"
        onPress={() => navigation.navigate('Signup')}
        variant="outline"
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xxl + 2,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginBottom: Spacing.xxl,
    lineHeight: LineHeight.normal,
  },
  btn: {
    marginBottom: Spacing.md,
  },
});
