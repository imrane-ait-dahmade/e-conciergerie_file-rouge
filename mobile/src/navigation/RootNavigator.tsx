import { useAuth } from '@/src/context/AuthContext';
import { AuthNavigator } from '@/src/navigation/AuthNavigator';
import { MainTabNavigator } from '@/src/navigation/MainTabNavigator';
import { SplashScreen } from '@/src/screens/SplashScreen';

/**
 * Point d’entrée de la navigation :
 * - chargement du token → Splash
 * - pas de token → pile Auth (Welcome, Login, Signup)
 * - token présent → onglets App (Home, Search, Map, Profile)
 *
 * Dès que signIn / setAccessToken / signOut modifie le token, ce composant
 * bascule automatiquement entre les deux flux (pas besoin de reset manuel).
 */
export function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (token) {
    return <MainTabNavigator />;
  }

  return <AuthNavigator />;
}
