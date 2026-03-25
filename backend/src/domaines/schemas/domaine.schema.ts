/**
 * Domaine : secteur d’activité (ex. hôtellerie). Les établissements peuvent y être liés.
 * Collection MongoDB : domaines.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Domaine {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ required: false, trim: true })
  description?: string;
}

export const DomaineSchema = SchemaFactory.createForClass(Domaine);
