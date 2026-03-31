import type {
  PreferenceItem,
  ProfileMenuItem,
  UserProfile,
} from '@/src/types/profile.types';

/** Profil de démonstration — remplacé ou fusionné avec l’API utilisateur plus tard. */
export const MOCK_USER_PROFILE: UserProfile = {
  id: 'mock-user-1',
  firstName: 'Salma',
  lastName: 'El Amrani',
  fullName: 'Salma El Amrani',
  email: 'salma.elamrani@email.com',
  phone: '+212 6 12 34 56 78',
  city: 'Marrakech',
  avatar: null,
  memberSince: '2024-06-15',
  accountType: 'voyageur',
};

export const PROFILE_MAIN_MENU_ITEMS: ProfileMenuItem[] = [
  {
    id: 'reservations',
    title: 'Mes réservations',
    subtitle: 'Suivi et détails de vos séjours',
    icon: 'calendar-outline',
    type: 'navigation',
    routeKey: 'reservations',
  },
  {
    id: 'favorites',
    title: 'Mes favoris',
    subtitle: 'Services et offres enregistrés',
    icon: 'heart-outline',
    type: 'navigation',
    routeKey: 'favorites',
  },
  {
    id: 'history',
    title: 'Historique',
    subtitle: 'Activité récente',
    icon: 'time-outline',
    type: 'navigation',
    routeKey: 'history',
  },
  {
    id: 'payments',
    title: 'Moyens de paiement',
    subtitle: 'Cartes et facturation',
    icon: 'card-outline',
    type: 'navigation',
    routeKey: 'payments',
  },
  {
    id: 'addresses',
    title: 'Adresses',
    subtitle: 'Lieux et localisations sauvegardés',
    icon: 'location-outline',
    type: 'navigation',
    routeKey: 'addresses',
  },
  {
    id: 'settings',
    title: 'Paramètres',
    subtitle: 'Compte, sécurité, confidentialité',
    icon: 'settings-outline',
    type: 'navigation',
    routeKey: 'settings',
  },
  {
    id: 'help',
    title: 'Aide & support',
    subtitle: 'FAQ et contact',
    icon: 'help-circle-outline',
    type: 'navigation',
    routeKey: 'help',
  },
  {
    id: 'about',
    title: 'À propos',
    subtitle: 'E-conciergerie',
    icon: 'information-circle-outline',
    type: 'navigation',
    routeKey: 'about',
  },
];

export const PROFILE_PREFERENCE_ITEMS: PreferenceItem[] = [
  {
    id: 'pref-lang',
    title: 'Langue',
    subtitle: 'Français',
    icon: 'language-outline',
    preferenceKey: 'language',
  },
  {
    id: 'pref-notif',
    title: 'Notifications',
    subtitle: 'Push et rappels',
    icon: 'notifications-outline',
    preferenceKey: 'notifications',
  },
  {
    id: 'pref-loc',
    title: 'Localisation',
    subtitle: 'Services près de vous',
    icon: 'navigate-outline',
    preferenceKey: 'location',
  },
];
