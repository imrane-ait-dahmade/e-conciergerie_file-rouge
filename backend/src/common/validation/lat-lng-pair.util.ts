import { BadRequestException } from '@nestjs/common';

const PAIR_MSG =
  'latitude et longitude doivent être fournis ensemble, tous deux absents, ou tous deux null pour effacer';

const PATCH_MSG =
  'Pour modifier la géolocalisation, envoyez latitude et longitude ensemble (ou les deux à null pour effacer)';

/**
 * Création : les deux coordonnées sont absentes, ou les deux sont des nombres valides,
 * ou les deux sont `null` pour effacer explicitement.
 */
export function assertLatLngPair(dto: {
  latitude?: number | null;
  longitude?: number | null;
}): void {
  const latP = dto.latitude !== undefined && dto.latitude !== null;
  const lngP = dto.longitude !== undefined && dto.longitude !== null;
  if (latP !== lngP) {
    throw new BadRequestException(PAIR_MSG);
  }
}

/**
 * Mise à jour partielle : on ne valide que si au moins une des deux propriétés est « touchée »
 * (valeur autre que `undefined`, y compris `null` explicite dans le JSON).
 */
export function assertLatLngPairForPatch(dto: object): void {
  const o = dto as Record<string, unknown>;
  const touchesLat = o.latitude !== undefined;
  const touchesLng = o.longitude !== undefined;
  if (!touchesLat && !touchesLng) {
    return;
  }
  if (touchesLat !== touchesLng) {
    throw new BadRequestException(PATCH_MSG);
  }
  const latP = o.latitude !== undefined && o.latitude !== null;
  const lngP = o.longitude !== undefined && o.longitude !== null;
  if (latP !== lngP) {
    throw new BadRequestException(PAIR_MSG);
  }
}
