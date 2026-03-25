/**
 * Profil administrateur : détails métier en plus du compte User (rôle admin).
 * Un document par user admin — le lien se fait via user.
 * Collection : admins.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'admins',
})
export class Admin {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ required: false, trim: true })
  notes?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
