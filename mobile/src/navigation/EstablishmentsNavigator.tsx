import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { EstablishmentsStackParamList } from '@/src/navigation/navigationTypes';
import { EstablishmentDetailsScreen } from '@/src/screens/EstablishmentDetailsScreen';
import { EstablishmentsScreen } from '@/src/screens/EstablishmentsScreen';

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
        component={EstablishmentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EstablishmentDetails"
        component={EstablishmentDetailsScreen}
        options={{ title: 'Détail' }}
      />
    </Stack.Navigator>
  );
}
