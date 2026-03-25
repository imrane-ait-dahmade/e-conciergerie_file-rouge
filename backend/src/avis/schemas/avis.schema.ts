/**
 * Avis : note et texte d’un client sur un établissement et/ou un service.
 * Collection : avis.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Avis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  voyageur: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Etablissement', required: false })
  etablissement?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: false })
  service?: Types.ObjectId;

  /** Note de 1 à 5. */
  @Prop({ required: true, min: 1, max: 5 })
  note: number;

  @Prop({ required: false, trim: true })
  commentaire?: string;
}

export const AvisSchema = SchemaFactory.createForClass(Avis);
