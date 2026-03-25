/**
 * Modèle `Quartier` → collection `quartiers`.
 *
 * Équivalent Laravel : `belongsTo(Ville::class)` via `ville_id`.
 * Une ville a plusieurs quartiers : `hasMany(Quartier::class)`.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Quartier {
  @Prop({ required: true, trim: true })
  nom: string;

  /** Laravel : foreignId('ville_id')->constrained('villes') — belongsTo(Ville). */
  @Prop({ type: Types.ObjectId, ref: 'Ville', required: true })
  ville: Types.ObjectId;
}

export const QuartierSchema = SchemaFactory.createForClass(Quartier);
