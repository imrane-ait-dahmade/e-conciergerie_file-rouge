/**
 * Service : type de prestation rattaché à un domaine métier (ex. domaine « Hébergement »
 * → services « Hôtelier », « Location courte durée », etc.). Collection : services.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ required: false, trim: true })
  description?: string;

  /** Clé d’icône client ou URL (optionnel). */
  @Prop({ required: false, trim: true })
  icon?: string;

  /** Secteur métier (ex. hébergement, restauration). */
  @Prop({ type: Types.ObjectId, ref: 'Domaine', required: true })
  domaine: Types.ObjectId;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
