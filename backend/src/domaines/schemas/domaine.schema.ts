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

  /** Clé d’icône côté client (ex. bed, plane, utensils) — optionnel pour rétrocompatibilité. */
  @Prop({ required: false, trim: true })
  icon?: string;

  /** Identifiant stable pour API / deep links (généré depuis le nom si absent à la création). */
  @Prop({ required: false, trim: true, lowercase: true })
  slug?: string;

  /** Masqué sur la Home mobile lorsque false. Défaut true pour les documents sans champ. */
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  /** Ordre d’affichage sur la Home (croissant). Défaut 0. */
  @Prop({ type: Number, default: 0 })
  order: number;
}

export const DomaineSchema = SchemaFactory.createForClass(Domaine);
