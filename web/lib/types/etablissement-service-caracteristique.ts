/**
 * Ligne `EtablissementServiceCaracteristique` (offre = liaison établissement–service).
 */
export type EtablissementServiceCaracteristiqueDoc = {
  _id: string;
  etablissementService: string;
  libelle: string;
  valeur: string;
  createdAt?: string;
  updatedAt?: string;
};
