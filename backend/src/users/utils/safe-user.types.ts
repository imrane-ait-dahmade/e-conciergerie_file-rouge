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

/** Profil métier lié au rôle (collections voyageurs / prestataires / admins). */
export type RoleProfileDto =
  | { type: 'client'; preferences?: string }
  | { type: 'prestataire'; raisonSociale?: string; siret?: string }
  | { type: 'admin'; notes?: string };

/** Détail admin : utilisateur sûr + profil de rôle si présent. */
export type AdminUserDetailResponse = SafeUserResponse & {
  profile: RoleProfileDto | null;
};
