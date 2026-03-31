import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { BottomNav } from '@/src/components/navigation/BottomNav';
import { EstablishmentsNavigator } from '@/src/navigation/EstablishmentsNavigator';
import { HomeNavigator } from '@/src/navigation/HomeNavigator';
import type { MainTabParamList } from '@/src/navigation/navigationTypes';
import { MapScreen } from '@/src/screens/MapScreen';
import { ProfileScreen } from '@/src/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Onglets : Accueil, Recherche (liste établissements), Carte, Profil — barre personnalisée.
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          title: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Search"
        component={EstablishmentsNavigator}
        options={{
          title: 'Recherche',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Carte',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}
