/**
 * Profil voyageur (client) : préférences en plus du User (rôle client).
 * Collection : voyageurs.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'voyageurs',
})
export class Voyageur {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ required: false, trim: true })
  preferences?: string;
}

export const VoyageurSchema = SchemaFactory.createForClass(Voyageur);
