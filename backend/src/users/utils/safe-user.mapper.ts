/**
 * Transforme un document User en objet sûr pour le client (sans mot de passe ni tokens).
 * Laravel : équivalent de $user->makeHidden(['password']) puis retour de l'objet.
 */
export function toSafeUserResponse(user: Record<string, unknown>): {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} {
  return {
    id: String(user?._id ?? ''),
    nom: String(user?.nom ?? ''),
    prenom: String(user?.prenom ?? ''),
    email: String(user?.email ?? ''),
    telephone: user?.telephone as string | undefined,
    adresse: user?.adresse as string | undefined,
    isActive: (user?.isActive as boolean) ?? true,
    createdAt: user?.createdAt as Date | undefined,
    updatedAt: user?.updatedAt as Date | undefined,
  };
}
