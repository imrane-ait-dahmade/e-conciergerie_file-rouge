/**
 * Caractéristique attachée à une ligne etablissement_service (UML : …_Caracteristique).
 * Différent du modèle Caracteristique global : ici c’est par offre (liaison établissement–service).
 * Collection : etablissement_service_caracteristiques.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'etablissement_service_caracteristiques',
})
export class EtablissementServiceCaracteristique {
  @Prop({
    type: Types.ObjectId,
    ref: 'EtablissementService',
    required: true,
  })
  etablissementService: Types.ObjectId;

  @Prop({ required: true, trim: true })
  libelle: string;

  @Prop({ required: true, trim: true })
  valeur: string;
}

export const EtablissementServiceCaracteristiqueSchema =
  SchemaFactory.createForClass(EtablissementServiceCaracteristique);
