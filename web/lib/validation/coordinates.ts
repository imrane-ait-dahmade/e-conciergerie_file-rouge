/** Parse optional coordinate from form string; empty → null. */
export function parseCoordField(raw: string | undefined): number | null {
  if (raw === undefined || raw === null) return null;
  const t = String(raw).trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function isLatValid(n: number | null): boolean {
  if (n === null) return true;
  return n >= -90 && n <= 90;
}

export function isLngValid(n: number | null): boolean {
  if (n === null) return true;
  return n >= -180 && n <= 180;
}

/** Pair rule: both null or both numbers (validated separately for range). */
export function isLatLngPairComplete(lat: number | null, lng: number | null): boolean {
  if (lat === null && lng === null) return true;
  if (lat !== null && lng !== null) return true;
  return false;
}
