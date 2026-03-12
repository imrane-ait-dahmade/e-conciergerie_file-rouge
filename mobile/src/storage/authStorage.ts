import AsyncStorage from '@react-native-async-storage/async-storage';

// JWT d’accès renvoyé par POST /auth/login ou /auth/signup (Authorization: Bearer …)
const TOKEN_KEY = 'econciergerie_access_token';

/**
 * Lit le accessToken sauvegardé sur le téléphone.
 */
export async function loadToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Enregistre le accessToken après connexion / inscription (ou le supprime à la déconnexion).
 */
export async function saveToken(token: string | null): Promise<void> {
  if (token === null) {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
}
