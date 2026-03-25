/**
 * Pays (référentiel géographique). Collection : pays.
 * UML « Nation » : même concept — on utilise ce schéma, pas une collection séparée.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true, // createdAt / updatedAt gérés par Mongoose
})
export class Pays {
  /** Nom du pays (unique pour éviter les doublons). */
  @Prop({ required: true, unique: true, trim: true })
  nom: string;

  /** Code ISO optionnel (ex. FR, SN). */
  @Prop({ required: false, trim: true, uppercase: true })
  code?: string;
}

export const PaysSchema = SchemaFactory.createForClass(Pays);
