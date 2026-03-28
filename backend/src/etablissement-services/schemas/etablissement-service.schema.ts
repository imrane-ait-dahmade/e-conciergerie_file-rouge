/**
 * Liaison établissement ↔ type de service (réf. Service).
 * Le modèle `Service` décrit un type de prestation rattaché à un domaine (ex. hébergement) ;
 * cette table relie un établissement concret à ce type (tarif, commentaire, etc.).
 * Collection : etablissement_services.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

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
}

export const EtablissementServiceSchema =
  SchemaFactory.createForClass(EtablissementService);

/** Un même type de service (catalogue) ne peut être assigné qu’une fois par établissement. */
EtablissementServiceSchema.index(
  { etablissement: 1, service: 1 },
  { unique: true },
);
