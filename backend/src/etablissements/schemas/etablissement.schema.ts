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
import { registerGeoPointFromLatLng } from '../../common/geo/register-geo-point.middleware';

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

  /**
   * Point GeoJSON dérivé de `latitude` / `longitude` (sync middleware).
   * Index 2dsphere pour proximité ; ne pas écrire à la main si lat/lng sont utilisés.
   */
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
    _id: false,
  })
  location?: { type: 'Point'; coordinates: [number, number] };

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  telephone?: string;

  @Prop({ required: false, lowercase: true, trim: true })
  email?: string;

  @Prop({ required: false })
  image?: string;

  /** Logo (URL / chemin). Distinct de `image` (visuel générique historique). */
  @Prop({ required: false, trim: true })
  logo?: string;

  /** Image de couverture pour cartes / hero (optionnel). */
  @Prop({ required: false, trim: true })
  coverImage?: string;

  /**
   * Slug URL unique (optionnel tant que les anciens documents ne sont pas migrés).
   * sparse + unique : plusieurs documents sans slug restent valides.
   */
  @Prop({
    required: false,
    trim: true,
    lowercase: true,
    maxlength: 120,
    unique: true,
    sparse: true,
  })
  slug?: string;

  /** Note moyenne dénormalisée (ex. agrégée depuis `avis`) — null si non calculée. */
  @Prop({ required: false, type: Number, min: 0, max: 5 })
  averageRating?: number;

  /** Nombre d’avis pris en compte pour la moyenne (section « Best providers »). */
  @Prop({ required: true, type: Number, default: 0, min: 0 })
  reviewCount: number;

  /** Mis en avant sur l’accueil — bloc « meilleurs prestataires ». */
  @Prop({ required: true, default: false })
  isFeaturedForHomeBestProviders: boolean;

  /** Ordre d’affichage dans le bloc accueil (plus petit = plus prioritaire). */
  @Prop({ required: true, type: Number, default: 0, min: 0 })
  bestProviderSortOrder: number;

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

registerGeoPointFromLatLng(EtablissementSchema);
EtablissementSchema.index({ location: '2dsphere' });

/**
 * Index pour filtres accueil / admin (slug gère déjà un index via unique sparse sur le champ).
 * Réversibilité : scripts `mongo-migrations/etablissements-best-providers.indexes.down.mongosh.js`
 * ou `collection.dropIndexes()` ciblé après retrait de ces lignes + syncIndexes.
 */
EtablissementSchema.index({ isActive: 1 });
EtablissementSchema.index({ isFeaturedForHomeBestProviders: 1 });
EtablissementSchema.index({ bestProviderSortOrder: 1 });
EtablissementSchema.index({
  isActive: 1,
  isFeaturedForHomeBestProviders: 1,
  bestProviderSortOrder: 1,
});
