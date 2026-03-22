import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { AppColors } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { ApiError, getProfile, type SafeUserResponse } from '@/src/services/api';

/**
 * Profil utilisateur (GET /users/profile avec Bearer).
 * Bouton pour se déconnecter (supprime le token local).
 */
export function ProfileScreen() {
  const { token, signOut } = useAuth();
  const [profile, setProfile] = useState<SafeUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!token) {
        setProfile(null);
        setLoading(false);
        setError('Non connecté');
        return () => {
          cancelled = true;
        };
      }
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const p = await getProfile(token);
          if (!cancelled) {
            setProfile(p);
          }
        } catch (e) {
          if (!cancelled) {
            const msg = e instanceof ApiError ? e.message : 'Impossible de charger le profil';
            setError(msg);
            setProfile(null);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [token]),
  );

  async function onLogout() {
    await signOut();
    // RootNavigator repasse sur AuthNavigator (Welcome) quand token devient null
  }

  if (!token) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Connectez-vous pour voir votre profil.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {profile ? (
        <>
          <Text style={styles.name}>
            {profile.prenom} {profile.nom}
          </Text>
          <Text style={styles.row}>{profile.email}</Text>
          {profile.telephone ? <Text style={styles.row}>{profile.telephone}</Text> : null}
          {profile.adresse ? <Text style={styles.row}>{profile.adresse}</Text> : null}
        </>
      ) : null}
      <PrimaryButton title="Se déconnecter" onPress={onLogout} style={styles.logout} variant="outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    padding: 24,
  },
  container: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: AppColors.background,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 12,
  },
  row: {
    fontSize: 15,
    color: AppColors.textMuted,
    marginBottom: 8,
  },
  muted: {
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  error: {
    color: AppColors.error,
    marginBottom: 12,
  },
  logout: {
    marginTop: 32,
  },
});
