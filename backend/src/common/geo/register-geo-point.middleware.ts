import { Schema } from 'mongoose';
import {
  applyGeoPointToUpdateOperators,
  buildGeoPointFromLatLng,
} from './geo-point.util';

type GeoDoc = {
  latitude?: unknown;
  longitude?: unknown;
  set?: (path: string, val: unknown) => void;
};

/**
 * Keeps `location` (GeoJSON Point) aligned with `latitude` / `longitude`.
 * - On save / insertMany: sets `location` or omits invalid partials.
 * - On findOneAndUpdate / updateOne: merges with the current document and patches `$set` / `$unset`.
 */
export function registerGeoPointFromLatLng(schema: Schema): void {
  schema.pre('save', function () {
    const doc = this as unknown as GeoDoc;
    const pt = buildGeoPointFromLatLng(doc.latitude, doc.longitude);
    if (typeof doc.set === 'function') {
      doc.set('location', pt);
    }
  });

  schema.pre('insertMany', function (docs: unknown | unknown[]) {
    const arr = Array.isArray(docs) ? docs : [docs];
    for (const raw of arr) {
      if (raw && typeof raw === 'object') {
        const d = raw as Record<string, unknown>;
        const pt = buildGeoPointFromLatLng(d.latitude, d.longitude);
        if (pt === undefined) {
          delete d.location;
        } else {
          d.location = pt;
        }
      }
    }
  });

  schema.pre(['findOneAndUpdate', 'updateOne'], async function () {
    const update = this.getUpdate() as Record<string, unknown> | null | undefined;
    if (update == null || Array.isArray(update)) {
      return;
    }

    const existing = await this.model
      .findOne(this.getFilter())
      .select('latitude longitude')
      .lean()
      .exec();

    applyGeoPointToUpdateOperators(update, existing);
  });
}
