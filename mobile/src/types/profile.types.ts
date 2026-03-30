import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Icône Ionicons (nom de glyphe). */
export type ProfileIconName = ComponentProps<typeof Ionicons>['name'];

/** Type de compte affiché sur le profil. */
export type ProfileAccountType = 'voyageur' | 'prestataire' | 'admin';

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  avatar: string | null;
  /** Date d’inscription (ISO ou libellé court). */
  memberSince: string;
  accountType: ProfileAccountType;
};

export type ProfileMenuItemType = 'navigation' | 'action';

/**
 * Entrée de menu profil.
 * `routeKey` sert à router depuis ProfileScreen (placeholder si non mappé).
 */
export type ProfileMenuItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: ProfileIconName;
  type: ProfileMenuItemType;
  /** Clé de navigation interne (gérée dans ProfileScreen). */
  routeKey: string;
};

export type PreferenceItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: ProfileIconName;
  /** Pour brancher un Switch ou navigation vers un écran dédié plus tard. */
  preferenceKey: 'language' | 'notifications' | 'location' | 'theme';
};
