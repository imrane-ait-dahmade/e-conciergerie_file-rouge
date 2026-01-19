/**
 * Schéma Mongoose pour la collection "etablissements".
 * prestataire = utilisateur propriétaire (référence User).
 *
 * Laravel : modèle Eloquent Etablissement + migration.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true }) // createdAt, updatedAt automatiques
export class Etablissement {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: false })
  adresse?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  telephone?: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  image?: string;

  // Propriétaire = utilisateur connecté qui crée l'établissement
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  prestataire: mongoose.Types.ObjectId;
}

export const EtablissementSchema = SchemaFactory.createForClass(Etablissement);
