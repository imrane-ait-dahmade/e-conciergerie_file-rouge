/**
 * Aligné sur GET/PATCH `/users/profile` (réponse « safe user »).
 */
export type UserProfile = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  isActive: boolean;
  role?: { id: string; name: string; label?: string };
  createdAt?: string;
  updatedAt?: string;
};
