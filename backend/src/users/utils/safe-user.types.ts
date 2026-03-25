/**
 * Structure des données utilisateur retournées au client.
 * Exclut : password, refreshTokenHash (données sensibles).
 */
export type SafeUserRole = {
  id: string;
  name: string;
  label?: string;
};

export type SafeUserResponse = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  isActive: boolean;
  role?: SafeUserRole;
  createdAt?: Date;
  updatedAt?: Date;
};
