/**
 * Ligne d’adresse libre : `adresse` (schéma Mongo) prioritaire si les deux sont fournis.
 * `address` est un alias API (spec anglaise).
 */
export function resolveAdresseLineForDto(dto: {
  adresse?: string;
  address?: string;
}): string | undefined {
  if (dto.adresse !== undefined) {
    return dto.adresse.trim();
  }
  if (dto.address !== undefined) {
    return dto.address.trim();
  }
  return undefined;
}
