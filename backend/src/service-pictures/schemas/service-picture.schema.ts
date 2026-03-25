/**
 * Image liée à un service (UML : Pictures_service). Référence un Media.
 * Collection : service_pictures.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'service_pictures',
})
export class ServicePicture {
  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true })
  media: Types.ObjectId;

  /** Ordre d’affichage (optionnel). */
  @Prop({ required: false })
  ordre?: number;
}

export const ServicePictureSchema = SchemaFactory.createForClass(ServicePicture);
