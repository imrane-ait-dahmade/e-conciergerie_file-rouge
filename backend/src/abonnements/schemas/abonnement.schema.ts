/**
 * Abonnement : offre récurrente pour un utilisateur (client ou prestataire selon ton métier).
 * Collection : abonnements.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Abonnement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  /** Nom du plan (ex. premium). */
  @Prop({ required: true, trim: true })
  plan: string;

  @Prop({ required: true, default: true })
  actif: boolean;

  @Prop({ required: false })
  dateFin?: Date;
}

export const AbonnementSchema = SchemaFactory.createForClass(Abonnement);
