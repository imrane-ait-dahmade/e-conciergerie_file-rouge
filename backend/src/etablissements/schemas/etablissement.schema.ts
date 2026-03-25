/**
 * Modèle `Etablissement` → collection `etablissements`.
 *
 * Équivalent Laravel : table `etablissements` avec plusieurs clés étrangères optionnelles.
 * - `belongsTo(User::class, 'prestataire_id')` — le prestataire (propriétaire).
 * - `belongsTo(Domaine::class)` — secteur métier (optionnel).
 * - `belongsTo(Pays::class)`, `belongsTo(Ville::class)`, `belongsTo(Quartier::class)` — localisation.
 * Côté User (prestataire) : `hasMany(Etablissement::class)`.
 * Côté établissement : `hasMany(Service::class)` pour les services proposés.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Etablissement {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ required: false, trim: true })
  adresse?: string;

  /** Coordonnées GPS optionnelles (carte, recherche). */
  @Prop({ required: false })
  latitude?: number;

  @Prop({ required: false })
  longitude?: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  telephone?: string;

  @Prop({ required: false, lowercase: true, trim: true })
  email?: string;

  @Prop({ required: false })
  image?: string;

  /** Indique si l’établissement est visible / actif côté application. */
  @Prop({ required: true, default: true })
  isActive: boolean;

  /** Laravel : foreignId('prestataire_id')->constrained('users') — belongsTo(User). */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  prestataire: Types.ObjectId;

  /** belongsTo(Domaine::class) — optionnel. */
  @Prop({ type: Types.ObjectId, ref: 'Domaine', required: false })
  domaine?: Types.ObjectId;

  /** belongsTo(Pays::class) — optionnel. */
  @Prop({ type: Types.ObjectId, ref: 'Pays', required: false })
  pays?: Types.ObjectId;

  /** belongsTo(Ville::class) — optionnel. */
  @Prop({ type: Types.ObjectId, ref: 'Ville', required: false })
  ville?: Types.ObjectId;

  /** belongsTo(Quartier::class) — optionnel. */
  @Prop({ type: Types.ObjectId, ref: 'Quartier', required: false })
  quartier?: Types.ObjectId;
}

export const EtablissementSchema = SchemaFactory.createForClass(Etablissement);
