/**
 * Logique métier partagée (admin + prestataire) pour les lieux d’assignation
 * « établissement ↔ service » — sans composant carte (celui-ci reste dans LocationPicker).
 */
import type { EtablissementServiceAssignment } from "@/lib/types/etablissement-service";
import {
  isLatLngPairComplete,
  isLatValid,
  isLngValid,
  parseCoordField,
} from "@/lib/validation/coordinates";

export function lineAdresseService(row: EtablissementServiceAssignment): string {
  return (row.adresse ?? row.address ?? "").trim();
}

/** Indique si la ligne a un lieu propre (adresse, coordonnées ou métadonnées lieu). */
export function hasSpecificGeo(row: EtablissementServiceAssignment): boolean {
  const lat = row.latitude;
  const lng = row.longitude;
  const hasPair =
    lat != null &&
    lng != null &&
    !Number.isNaN(Number(lat)) &&
    !Number.isNaN(Number(lng));
  const hasLine = lineAdresseService(row).length > 0;
  const hasMeta = !!(row.location_label?.trim() || row.location_type?.trim());
  return hasPair || hasLine || hasMeta;
}

export type LatLngValidationMessages = {
  validationLatLngPair: string;
  validationLatRange: string;
  validationLngRange: string;
};

/** Validation des champs lat/lng texte (même règle que les formulaires admin). */
export function validateAssignmentGeoStrings(
  latStr: string,
  lngStr: string,
  labels: LatLngValidationMessages,
): { latitude?: string; longitude?: string } | null {
  const lat = parseCoordField(latStr);
  const lng = parseCoordField(lngStr);
  const errs: { latitude?: string; longitude?: string } = {};
  if (!isLatLngPairComplete(lat, lng)) {
    errs.latitude = labels.validationLatLngPair;
    errs.longitude = labels.validationLatLngPair;
    return errs;
  }
  if (lat !== null && !isLatValid(lat)) errs.latitude = labels.validationLatRange;
  if (lng !== null && !isLngValid(lng)) errs.longitude = labels.validationLngRange;
  return Object.keys(errs).length ? errs : null;
}
