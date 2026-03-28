/**
 * Caractéristique : libellé descriptif (ex. « Wi‑Fi », « Parking »), éventuellement rattaché à un service.
 * Collection : caracteristiques.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Caracteristique {
  @Prop({ required: true, trim: true })
  libelle: string;

  /** Optionnel : caractéristique liée à un type de service. */
  @Prop({ type: Types.ObjectId, ref: 'Service', required: false })
  service?: Types.ObjectId;
}

export const CaracteristiqueSchema =
  SchemaFactory.createForClass(Caracteristique);
