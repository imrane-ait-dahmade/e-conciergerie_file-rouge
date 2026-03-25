/**
 * Média : fichier stocké (URL, type). Peut être lié à un utilisateur (upload).
 * Collection : media.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'media',
})
export class Media {
  @Prop({ required: true, trim: true })
  url: string;

  /** Ex. image, video, document — texte libre. */
  @Prop({ required: false, trim: true })
  type?: string;

  @Prop({ required: false, trim: true })
  mimeType?: string;

  /** Utilisateur qui a déposé le fichier (optionnel). */
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  uploadedBy?: Types.ObjectId;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
