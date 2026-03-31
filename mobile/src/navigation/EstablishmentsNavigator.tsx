import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { EstablishmentsStackParamList } from '@/src/navigation/navigationTypes';
import { EstablishmentDetailsScreen } from '@/src/screens/EstablishmentDetailsScreen';
import { SearchScreen } from '@/src/screens/SearchScreen';
import { ServiceDetailScreen } from '@/src/screens/ServiceDetailScreen';

const Stack = createNativeStackNavigator<EstablishmentsStackParamList>();

/**
 * Petite pile à l’intérieur de l’onglet « Établissements » :
 * liste → détail (comme une pile de pages web).
 */
export function EstablishmentsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EstablishmentsList"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EstablishmentDetails"
        component={EstablishmentDetailsScreen}
        options={{ title: 'Détail' }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
          title: 'Service',
        }}
      />
    </Stack.Navigator>
  );
}
