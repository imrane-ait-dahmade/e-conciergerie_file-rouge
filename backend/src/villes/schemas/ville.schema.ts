/**
 * Modèle `Ville` → collection `villes`.
 *
 * Équivalent Laravel : `belongsTo(Pays::class)` via `pays_id`.
 * Un pays a plusieurs villes : `hasMany(Ville::class)`.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Ville {
  @Prop({ required: true, trim: true })
  nom: string;

  /** Laravel : foreignId('pays_id')->constrained('pays') — belongsTo(Pays). */
  @Prop({ type: Types.ObjectId, ref: 'Pays', required: true })
  pays: Types.ObjectId;
}

export const VilleSchema = SchemaFactory.createForClass(Ville);
