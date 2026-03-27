/**
 * Service : prestation proposée par un établissement. Collection : services.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ required: false, trim: true })
  description?: string;

  /** Établissement qui propose ce service. */
  @Prop({ type: Types.ObjectId, ref: 'Etablissement', required: true })
  etablissement: Types.ObjectId;

  /** Secteur métier (domaine) — optionnel en base pour compatibilité ; requis à la création via l’API. */
  @Prop({ type: Types.ObjectId, ref: 'Domaine', required: false })
  domaine?: Types.ObjectId;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
