import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppColors } from '@/src/constants/theme';
import type { AuthStackParamList } from '@/src/navigation/navigationTypes';
import { LoginScreen } from '@/src/screens/LoginScreen';
import { SignupScreen } from '@/src/screens/SignupScreen';
import { WelcomeScreen } from '@/src/screens/WelcomeScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Flux authentification : écrans accessibles sans token.
 * L’écran initial est Welcome (boutons vers Login et Signup).
 */
export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: { backgroundColor: AppColors.card },
        headerTintColor: AppColors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: AppColors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Inscription' }} />
    </Stack.Navigator>
  );
}
