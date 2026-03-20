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
import { AppColors } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import type { AuthStackParamList } from '@/src/navigation/navigationTypes';
import { ApiError, signupRequest } from '@/src/services/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

/** Même règle que SignupDto NestJS — mot de passe fort */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).*$/;

/**
 * Inscription : POST /auth/signup.
 * Le serveur renvoie accessToken : après stockage, RootNavigator affiche l’app connectée.
 */
export function SignupScreen({ navigation }: Props) {
  const { setAccessToken } = useAuth();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(
        'Mot de passe : au moins une minuscule, une majuscule, un chiffre et un caractère spécial.',
      );
      return;
    }
    setLoading(true);
    try {
      const res = await signupRequest({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim().toLowerCase(),
        password,
        telephone: telephone.trim() || undefined,
        adresse: adresse.trim() || undefined,
      });
      await setAccessToken(res.accessToken);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Impossible de créer le compte';
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
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Dupont"
          placeholderTextColor={AppColors.textMuted}
        />
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Jean"
          placeholderTextColor={AppColors.textMuted}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="vous@exemple.com"
          placeholderTextColor={AppColors.textMuted}
        />
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={AppColors.textMuted}
        />
        <Text style={styles.label}>Téléphone (optionnel)</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
          placeholder="06 12 34 56 78"
          placeholderTextColor={AppColors.textMuted}
        />
        <Text style={styles.label}>Adresse (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={adresse}
          onChangeText={setAdresse}
          placeholder="Ville, rue…"
          placeholderTextColor={AppColors.textMuted}
          multiline
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="S’inscrire" onPress={onSubmit} loading={loading} />
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Déjà un compte ? Se connecter
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: AppColors.background },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: AppColors.card,
    color: AppColors.text,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  error: {
    color: AppColors.error,
    marginBottom: 12,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: AppColors.primary,
    fontSize: 15,
  },
});
