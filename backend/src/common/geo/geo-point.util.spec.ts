import {
  applyGeoPointToUpdateOperators,
  buildGeoPointFromLatLng,
  resolveProximityPoint,
} from './geo-point.util';

describe('geo-point.util', () => {
  describe('buildGeoPointFromLatLng', () => {
    it('returns GeoJSON with [lng, lat]', () => {
      expect(buildGeoPointFromLatLng(48.8566, 2.3522)).toEqual({
        type: 'Point',
        coordinates: [2.3522, 48.8566],
      });
    });

    it('returns undefined if only latitude is set', () => {
      expect(buildGeoPointFromLatLng(48, undefined)).toBeUndefined();
    });

    it('returns undefined if only longitude is set', () => {
      expect(buildGeoPointFromLatLng(undefined, 2.3)).toBeUndefined();
    });
  });

  describe('applyGeoPointToUpdateOperators', () => {
    it('adds $set.location when merged lat/lng are valid', () => {
      const update: Record<string, unknown> = {
        $set: { nom: 'X' },
      };
      applyGeoPointToUpdateOperators(update, {
        latitude: 10,
        longitude: 20,
      });
      expect(update.$set).toMatchObject({
        nom: 'X',
        location: { type: 'Point', coordinates: [20, 10] },
      });
    });

    it('uses $unset for location when longitude is removed from the document', () => {
      const update: Record<string, unknown> = {
        $unset: { longitude: 1 },
      };
      applyGeoPointToUpdateOperators(update, {
        latitude: 10,
        longitude: 20,
      });
      expect((update.$set as Record<string, unknown>).location).toBeUndefined();
      expect((update.$unset as Record<string, unknown>).location).toBe('');
    });
  });

  describe('resolveProximityPoint', () => {
    it('prefers liaison location over establishment', () => {
      const p = resolveProximityPoint(
        {
          location: { type: 'Point', coordinates: [1, 1] },
        },
        {
          location: { type: 'Point', coordinates: [9, 9] },
        },
      );
      expect(p?.coordinates).toEqual([1, 1]);
    });

    it('falls back to establishment when liaison has no point', () => {
      const p = resolveProximityPoint(
        { latitude: undefined, longitude: undefined },
        {
          latitude: 3,
          longitude: 4,
        },
      );
      expect(p).toEqual({ type: 'Point', coordinates: [4, 3] });
    });
  });
});
