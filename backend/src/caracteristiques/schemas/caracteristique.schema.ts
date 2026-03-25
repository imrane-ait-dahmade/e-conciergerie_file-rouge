/**
 * Caractéristique : paire libellé / valeur (ex. « Wi‑Fi » → « Gratuit »).
 * Peut viser un service et/ou un établissement. Collection : caracteristiques.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Caracteristique {
  @Prop({ required: true, trim: true })
  libelle: string;

  @Prop({ required: true, trim: true })
  valeur: string;

  /** Optionnel : caractéristique liée à un service. */
  @Prop({ type: Types.ObjectId, ref: 'Service', required: false })
  service?: Types.ObjectId;

  /** Optionnel : caractéristique liée à un établissement. */
  @Prop({ type: Types.ObjectId, ref: 'Etablissement', required: false })
  etablissement?: Types.ObjectId;
}

export const CaracteristiqueSchema = SchemaFactory.createForClass(Caracteristique);
