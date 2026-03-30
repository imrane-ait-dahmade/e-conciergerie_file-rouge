/**
 * GeoJSON Point helpers for MongoDB 2dsphere queries.
 * Coordinates are always stored as [longitude, latitude] per GeoJSON.
 */

export type GeoPoint = { type: 'Point'; coordinates: [number, number] };

export function hasValidLatLngPair(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Builds a GeoJSON Point, or `undefined` if the pair is incomplete or invalid.
 * Never returns a Point with a single coordinate or NaN.
 */
export function buildGeoPointFromLatLng(
  lat: unknown,
  lng: unknown,
): GeoPoint | undefined {
  if (!hasValidLatLngPair(lat, lng)) {
    return undefined;
  }
  return { type: 'Point', coordinates: [lng as number, lat as number] };
}

function flattenUpdateForMerge(update: Record<string, unknown>): {
  merged: Record<string, unknown>;
  unsetKeys: Set<string>;
} {
  const merged: Record<string, unknown> = {};
  const unsetKeys = new Set<string>();

  if (
    update.$set &&
    typeof update.$set === 'object' &&
    !Array.isArray(update.$set)
  ) {
    Object.assign(merged, update.$set);
  }
  for (const [k, v] of Object.entries(update)) {
    if (!k.startsWith('$')) {
      merged[k] = v;
    }
  }
  if (
    update.$unset &&
    typeof update.$unset === 'object' &&
    update.$unset !== null &&
    !Array.isArray(update.$unset)
  ) {
    for (const key of Object.keys(update.$unset as Record<string, unknown>)) {
      unsetKeys.add(key);
    }
  }
  return { merged, unsetKeys };
}

function computeLatLngAfterMutation(
  existing: { latitude?: unknown; longitude?: unknown } | null | undefined,
  merged: Record<string, unknown>,
  unsetKeys: Set<string>,
): { lat: unknown; lng: unknown } {
  let lat = existing?.latitude;
  let lng = existing?.longitude;

  if (unsetKeys.has('latitude')) {
    lat = undefined;
  } else if (Object.prototype.hasOwnProperty.call(merged, 'latitude')) {
    lat = merged.latitude === null ? undefined : merged.latitude;
  }

  if (unsetKeys.has('longitude')) {
    lng = undefined;
  } else if (Object.prototype.hasOwnProperty.call(merged, 'longitude')) {
    lng = merged.longitude === null ? undefined : merged.longitude;
  }

  return { lat, lng };
}

/**
 * Mutates a Mongoose findOneAndUpdate / updateOne payload so `location` stays in sync
 * with `latitude` / `longitude` after the update is applied.
 */
export function applyGeoPointToUpdateOperators(
  update: Record<string, unknown>,
  existing: { latitude?: unknown; longitude?: unknown } | null | undefined,
): void {
  const { merged, unsetKeys } = flattenUpdateForMerge(update);
  const { lat, lng } = computeLatLngAfterMutation(existing, merged, unsetKeys);
  const pt = buildGeoPointFromLatLng(lat, lng);

  if (!update.$set || typeof update.$set !== 'object' || Array.isArray(update.$set)) {
    update.$set = {};
  }
  const $set = update.$set as Record<string, unknown>;

  if (pt === undefined) {
    delete $set.location;
    if (!update.$unset || typeof update.$unset !== 'object' || Array.isArray(update.$unset)) {
      update.$unset = {};
    }
    (update.$unset as Record<string, unknown>).location = '';
  } else {
    $set.location = pt;
    if (
      update.$unset &&
      typeof update.$unset === 'object' &&
      !Array.isArray(update.$unset)
    ) {
      delete (update.$unset as Record<string, unknown>).location;
    }
  }

  if (
    update.$unset &&
    typeof update.$unset === 'object' &&
    !Array.isArray(update.$unset) &&
    Object.keys(update.$unset as object).length === 0
  ) {
    delete update.$unset;
  }
}

/**
 * Future proximity pipelines: prefer a service-specific Point, else the establishment Point.
 * Use after populating `etablissement` (or a separate lookup) with geo fields.
 */
export function resolveProximityPoint(
  liaison: {
    location?: GeoPoint | null;
    latitude?: number | null;
    longitude?: number | null;
  },
  etablissement: {
    location?: GeoPoint | null;
    latitude?: number | null;
    longitude?: number | null;
  },
): GeoPoint | undefined {
  if (
    liaison.location?.type === 'Point' &&
    Array.isArray(liaison.location.coordinates) &&
    liaison.location.coordinates.length === 2
  ) {
    return liaison.location as GeoPoint;
  }
  const fromLiaison = buildGeoPointFromLatLng(
    liaison.latitude,
    liaison.longitude,
  );
  if (fromLiaison) {
    return fromLiaison;
  }
  if (
    etablissement.location?.type === 'Point' &&
    Array.isArray(etablissement.location.coordinates) &&
    etablissement.location.coordinates.length === 2
  ) {
    return etablissement.location as GeoPoint;
  }
  return buildGeoPointFromLatLng(
    etablissement.latitude,
    etablissement.longitude,
  );
}
