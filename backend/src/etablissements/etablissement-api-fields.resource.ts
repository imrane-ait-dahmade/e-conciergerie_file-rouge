/**
 * Champs exposés de façon stable pour les API admin / prestataire (complément au schéma Mongo).
 * `address` reflète `adresse` (libellé métier anglais côté spec).
 */
export function withEtablissementLocationApiFields<
  T extends Record<string, unknown>,
>(doc: T): T {
  return {
    ...doc,
    address: doc.adresse ?? null,
    location: doc.location ?? null,
  } as T;
}
