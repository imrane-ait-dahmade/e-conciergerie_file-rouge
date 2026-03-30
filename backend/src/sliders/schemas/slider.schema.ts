/**
 * Slider : diapositive du carrousel hero (page d’accueil web/mobile). Collection : sliders.
 *
 * Équivalent Laravel : table `sliders` + migration + `$fillable` / `$casts`.
 * Ici : schéma Mongoose (types + défauts + index). Les champs API sont en camelCase
 * comme le reste du backend (`isActive`, `sortOrder`, etc.).
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SliderDocument = HydratedDocument<Slider>;

@Schema({
  collection: 'sliders',
  timestamps: true,
})
export class Slider {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false, trim: true })
  description?: string;

  /** Pastille au-dessus du titre (ex. « Événement », « Hôtel »). */
  @Prop({ required: false, trim: true, maxlength: 80 })
  badge?: string;

  /**
   * Clé stable pour seed idempotent (upsert). Non utilisée par l’API publique.
   * unique + sparse : les documents sans `seedKey` restent autorisés.
   */
  @Prop({ required: false, trim: true, unique: true, sparse: true })
  seedKey?: string;

  /** URL ou chemin d’accès vers l’image (pas de référence Media pour l’instant). */
  @Prop({ required: true, trim: true })
  picture: string;

  @Prop({ required: false, trim: true })
  color?: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: 0 })
  sortOrder: number;

  @Prop({ required: false, trim: true })
  buttonText?: string;

  @Prop({ required: false, trim: true })
  buttonLink?: string;

  /** Début de publication (inclus). Null = pas de borne. */
  @Prop({ required: false, type: Date })
  startsAt?: Date;

  /** Fin de publication (inclus). Null = pas de borne. */
  @Prop({ required: false, type: Date })
  endsAt?: Date;
}

export const SliderSchema = SchemaFactory.createForClass(Slider);

/**
 * Index pour listes filtrées / triées / fenêtres de dates.
 * Réversibilité : retirer ces lignes puis `Model.syncIndexes()` (ou supprimer les index dans mongosh).
 */
SliderSchema.index({ isActive: 1 });
SliderSchema.index({ sortOrder: 1 });
SliderSchema.index({ startsAt: 1 });
SliderSchema.index({ endsAt: 1 });
/** Requête typique : slides actifs triés pour le carrousel. */
SliderSchema.index({ isActive: 1, sortOrder: 1 });
