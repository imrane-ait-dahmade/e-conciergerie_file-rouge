/**
 * Réponse GET /etablissement-services (populate etablissement + service + domaine).
 */
import type { ServiceDoc } from "@/lib/types/catalog";

export type EtablissementPopulated = {
  _id: string;
  nom?: string;
  adresse?: string;
  isActive?: boolean;
};

export type EtablissementServiceAssignment = {
  _id: string;
  etablissement: EtablissementPopulated | string;
  service: ServiceDoc | string;
  prix?: number;
  commentaire?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Extrait l’_id d’une ref populate ou d’une chaîne ObjectId. */
export function refId(ref: unknown): string {
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object" && "_id" in ref) {
    return String((ref as { _id: unknown })._id);
  }
  return "";
}
