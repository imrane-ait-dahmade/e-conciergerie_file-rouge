import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Pile « Accueil » : home mock → détail service.
 */
export type HomeStackParamList = {
  HomeMain: undefined;
  ServiceDetail: { serviceId?: string };
};

/**
 * Paramètres des écrans de la pile « Établissements » (liste + détail).
 */
export type EstablishmentsStackParamList = {
  EstablishmentsList: undefined;
  EstablishmentDetails: { id: string };
};

/**
 * Onglets principaux une fois connecté : Accueil, Recherche (établissements), Carte, Profil.
 */
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Search: NavigatorScreenParams<EstablishmentsStackParamList>;
  Map: undefined;
  Profile: undefined;
};

/**
 * Pile « hors connexion » : Welcome → Login / Signup.
 */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};
