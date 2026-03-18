import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppColors } from '@/src/constants/theme';
import { EstablishmentsNavigator } from '@/src/navigation/EstablishmentsNavigator';
import type { MainTabParamList } from '@/src/navigation/navigationTypes';
import { HomeScreen } from '@/src/screens/HomeScreen';
import { ProfileScreen } from '@/src/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Barre d’onglets en bas : Accueil, Établissements, Profil.
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Establishments"
        component={EstablishmentsNavigator}
        options={{
          title: 'Établissements',
          tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
