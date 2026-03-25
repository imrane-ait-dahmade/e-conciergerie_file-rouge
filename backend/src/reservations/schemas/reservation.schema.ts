/**
 * Réservation : le client réserve un service ; on garde aussi établissement et prestataire pour les filtres.
 * Collection : reservations.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

/** Valeurs possibles pour le champ statut. */
export type StatutReservation =
  | 'demandee'
  | 'confirmee'
  | 'annulee'
  | 'terminee';

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  voyageur: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Etablissement', required: true })
  etablissement: Types.ObjectId;

  /** Propriétaire de l’offre (user prestataire). */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  prestataire: Types.ObjectId;

  @Prop({ required: true })
  dateDebut: Date;

  @Prop({ required: true })
  dateFin: Date;

  @Prop({ required: true, trim: true, default: 'demandee' })
  statut: StatutReservation;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
