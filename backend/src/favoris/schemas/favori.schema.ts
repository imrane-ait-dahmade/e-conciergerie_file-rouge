/**
 * Favori : un client (user « voyageur ») marque un établissement et/ou un service.
 * Collection : favoris.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Favori {
  /** Utilisateur client (pas de table séparée « voyageur »). */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  voyageur: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Etablissement', required: false })
  etablissement?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: false })
  service?: Types.ObjectId;
}

export const FavoriSchema = SchemaFactory.createForClass(Favori);
