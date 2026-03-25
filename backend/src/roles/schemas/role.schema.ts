/**
 * Modèle `Role` → collection `roles`.
 *
 * Équivalent Laravel : table `roles` avec `name` unique (slug), `label` optionnel.
 * Relation inverse : `User` a `belongsTo(Role)` — un rôle peut avoir plusieurs users : `hasMany(User::class)`.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Role {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  name: string;

  /** Libellé affiché (ex. « Client ») — optionnel côté API. */
  @Prop({ required: false, trim: true })
  label?: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
