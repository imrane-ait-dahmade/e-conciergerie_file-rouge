import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { HomeStackParamList } from '@/src/navigation/navigationTypes';
import { HomeScreen } from '@/src/screens/HomeScreen';
import { ServiceDetailScreen } from '@/src/screens/ServiceDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

/**
 * Pile de l’onglet Accueil : écran principal → détail service.
 */
export function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
