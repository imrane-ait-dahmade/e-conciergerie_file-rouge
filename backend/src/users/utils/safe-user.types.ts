/**
 * Structure des données utilisateur retournées au client.
 * Exclut : password, refreshTokenHash (données sensibles).
 */
export type SafeUserResponse = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
