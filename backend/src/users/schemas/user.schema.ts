/**
 * Schéma Mongoose pour la collection "users".
 * Définit la structure des documents utilisateur en base MongoDB.
 *
 * Laravel : équivalent du modèle Eloquent User + migration create_users_table.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement (comme $table->timestamps())
})
export class User {
  // Champs obligatoires (required: true)
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  prenom: string;

  // unique = pas de doublon, lowercase/trim = normalisation
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // select: false = jamais inclus par défaut (comme $hidden en Laravel)
  @Prop({ required: true, select: false })
  password: string;

  // Champs optionnels (required: false)
  @Prop({ required: false })
  telephone?: string;

  @Prop({ required: false })
  adresse?: string;

  // default: true = nouveau user actif par défaut
  @Prop({ required: true, default: true })
  isActive: boolean;

  // Hash du refresh token JWT (pour logout). select: false = jamais exposé.
  @Prop({ required: false, select: false })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
