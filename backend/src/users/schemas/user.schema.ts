/**
 * Modèle `User` → collection MongoDB `users`.
 *
 * Équivalent Laravel :
 * - Migration : `users` avec `role_id` (clé étrangère vers `roles`), `nom`, `prenom`, `email` unique, etc.
 * - Modèle : `belongsTo(Role::class)` sur `role_id`.
 * - `populate('role')` ≈ `with('role')` ou `$user->role` en Eloquent.
 *
 * Différence SQL vs MongoDB : pas de contrainte FK en base ; l’ObjectId doit juste pointer vers un `_id` existant.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true, // comme $table->timestamps() → created_at, updated_at
})
export class User {
  /** Laravel : foreignId('role_id')->constrained('roles') — ici champ `role` = ObjectId vers Role. */
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  // Champs obligatoires (required: true)
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  prenom: string;

  // unique = pas de doublon, lowercase/trim = normalisation
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // select: false ≈ $hidden dans le modèle Laravel (pas chargé par défaut)
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
