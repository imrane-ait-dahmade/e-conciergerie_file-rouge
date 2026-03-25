/**
 * Profil prestataire : infos pro (SIRET, etc.) en plus du User (rôle prestataire).
 * Collection : prestataires.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'prestataires',
})
export class Prestataire {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ required: false, trim: true })
  raisonSociale?: string;

  @Prop({ required: false, trim: true })
  siret?: string;
}

export const PrestataireSchema = SchemaFactory.createForClass(Prestataire);
