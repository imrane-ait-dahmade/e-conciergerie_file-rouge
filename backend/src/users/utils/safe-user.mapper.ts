import type { SafeUserResponse } from './safe-user.types';

function mapRole(role: unknown): SafeUserResponse['role'] {
  if (!role || typeof role !== 'object') {
    return undefined;
  }
  const r = role as { _id?: unknown; name?: string; label?: string };
  if (typeof r.name !== 'string') {
    return undefined;
  }
  return {
    id: String(r._id ?? ''),
    name: r.name,
    label: r.label,
  };
}

/**
 * Transforme un document User en objet sûr pour le client (sans mot de passe ni tokens).
 * Laravel : équivalent de $user->makeHidden(['password']) puis retour de l'objet.
 */
export function toSafeUserResponse(
  user: Record<string, unknown>,
): SafeUserResponse {
  return {
    id: String(user?._id ?? ''),
    nom: String(user?.nom ?? ''),
    prenom: String(user?.prenom ?? ''),
    email: String(user?.email ?? ''),
    telephone: user?.telephone as string | undefined,
    adresse: user?.adresse as string | undefined,
    isActive: (user?.isActive as boolean) ?? true,
    role: mapRole(user?.role),
    createdAt: user?.createdAt as Date | undefined,
    updatedAt: user?.updatedAt as Date | undefined,
  };
}
