/**
 * Paiement : montant lié à une réservation. Collection : paiements.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type StatutPaiement =
  | 'en_attente'
  | 'autorise'
  | 'capture'
  | 'echoue'
  | 'rembourse';

@Schema({ timestamps: true })
export class Paiement {
  @Prop({ type: Types.ObjectId, ref: 'Reservation', required: true })
  reservation: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  voyageur: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  montant: number;

  @Prop({ required: true, trim: true, default: 'en_attente' })
  statut: StatutPaiement;

  /** Ex. carte, mobile money — texte libre. */
  @Prop({ required: false, trim: true })
  methode?: string;
}

export const PaiementSchema = SchemaFactory.createForClass(Paiement);
