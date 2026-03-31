import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { ApiError } from '@/src/services/api';
import type { AuthStackParamList } from '@/src/navigation/navigationTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/**
 * Connexion : email + mot de passe → POST /auth/login, puis stockage du accessToken.
 * Le RootNavigator affiche ensuite automatiquement les onglets (app connectée).
 */
export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Impossible de se connecter';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          placeholder="vous@exemple.com"
          placeholderTextColor={Colors.textMuted}
        />
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={Colors.textMuted}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="Connexion" onPress={onSubmit} loading={loading} />
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Pas encore de compte ? S’inscrire
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl + Spacing.base,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    marginBottom: Spacing.base,
    backgroundColor: Colors.card,
    color: Colors.text,
  },
  error: {
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  link: {
    marginTop: Spacing.lg,
    textAlign: 'center',
    color: Colors.primary,
    fontSize: FontSize.md,
  },
});
