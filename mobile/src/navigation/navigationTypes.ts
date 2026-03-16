import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Paramètres des écrans de la pile « Établissements » (liste + détail).
 */
export type EstablishmentsStackParamList = {
  EstablishmentsList: undefined;
  EstablishmentDetails: { id: string };
};

/**
 * Onglets principaux une fois connecté : Accueil, Établissements, Profil.
 */
export type MainTabParamList = {
  Home: undefined;
  Establishments: NavigatorScreenParams<EstablishmentsStackParamList>;
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
