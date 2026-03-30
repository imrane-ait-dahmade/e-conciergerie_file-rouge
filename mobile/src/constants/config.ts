import Constants from 'expo-constants';

/**
 * URL de base de l’API NestJS.
 * Définis EXPO_PUBLIC_API_URL dans un fichier .env à la racine du dossier mobile
 * (ex. http://192.168.1.10:3000 pour un téléphone sur le même Wi‑Fi que le PC).
 */
function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.length > 0) {
    let base = fromEnv.replace(/\/$/, '');
    // Sans schéma, fetch résout en URL relative → préfixe incorrect (ex. localhost:8081/192.168…)
    if (!/^https?:\/\//i.test(base)) {
      base = `http://${base}`;
    }
    return base;
  }
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  if (extra?.apiUrl) {
    return String(extra.apiUrl).replace(/\/$/, '');
  }
  // Émulateur Android : 10.0.2.2 = machine hôte ; iOS simulateur peut utiliser localhost
  return 'http://localhost:3000';
}

export const API_BASE_URL = getApiBaseUrl();
