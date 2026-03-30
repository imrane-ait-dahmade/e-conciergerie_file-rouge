/**
 * Liaison établissement ↔ type de service (réf. Service).
 * Le modèle `Service` décrit un type de prestation rattaché à un domaine (ex. hébergement) ;
 * cette table relie un établissement concret à ce type (tarif, commentaire, etc.).
 * Collection : etablissement_services.
 *
 * Proximité (voyageur) : pour une ligne, utiliser d’abord `location` / lat-lng propres à l’offre ;
 * si absents, retomber sur la géolocalisation de l’`Etablissement` parent (voir `resolveProximityPoint`).
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { registerGeoPointFromLatLng } from '../../common/geo/register-geo-point.middleware';

@Schema({
  timestamps: true,
  collection: 'etablissement_services',
})
export class EtablissementService {
  @Prop({ type: Types.ObjectId, ref: 'Etablissement', required: true })
  etablissement: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId;

  @Prop({ required: false, min: 0 })
  prix?: number;

  @Prop({ required: false, trim: true })
  commentaire?: string;

  /** Visible côté voyageur (offre masquée si `false`). */
  @Prop({ required: true, default: true })
  isActive: boolean;

  /** Adresse libre de l’offre si le lieu diffère du siège (équivalent métier « address »). */
  @Prop({ required: false, trim: true })
  adresse?: string;

  @Prop({ required: false })
  latitude?: number;

  @Prop({ required: false })
  longitude?: number;

  @Prop({ required: false, trim: true })
  location_label?: string;

  @Prop({ required: false, trim: true })
  location_type?: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
    _id: false,
  })
  location?: { type: 'Point'; coordinates: [number, number] };
}

export const EtablissementServiceSchema =
  SchemaFactory.createForClass(EtablissementService);

registerGeoPointFromLatLng(EtablissementServiceSchema);
EtablissementServiceSchema.index({ location: '2dsphere' });

/** Un même type de service (catalogue) ne peut être assigné qu’une fois par établissement. */
EtablissementServiceSchema.index(
  { etablissement: 1, service: 1 },
  { unique: true },
);
