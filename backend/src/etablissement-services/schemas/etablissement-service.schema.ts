/**
 * Liaison établissement ↔ service (UML : table etablissement_service).
 * Sert à stocker des infos de pivot (ex. tarif) pour la paire.
 *
 * Le modèle Service a déjà un champ etablissement : la même paire doit rester cohérente
 * (même établissement sur le Service que sur cette ligne).
 * Collection : etablissement_services.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'etablissement_services',
})
export class EtablissementService {
  @Prop({ type: Types.ObjectId, ref: 'Etablissement', required: true })
  etablissement: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId;

  @Prop({ required: false, min: 0 })
  prix?: number;

  @Prop({ required: false, trim: true })
  commentaire?: string;
}

export const EtablissementServiceSchema =
  SchemaFactory.createForClass(EtablissementService);
