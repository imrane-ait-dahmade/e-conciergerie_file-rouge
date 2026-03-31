/**
 * Champs géo exposés pour les réponses API (admin / prestataire).
 */
export function withEtablissementServiceLocationApiFields<
  T extends Record<string, unknown>,
>(doc: T): T {
  return {
    ...doc,
    address: doc.adresse ?? null,
    location: doc.location ?? null,
  } as T;
}
