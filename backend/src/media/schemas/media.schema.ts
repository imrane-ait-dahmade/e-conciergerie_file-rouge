/**
 * Média : fichier dans MinIO + métadonnées en base.
 *
 * Lien logique : `entityType` + `entityId` (réutilisable : établissement, service, ville, pays).
 * Les champs `etablissementId` / `etablissementServiceId` restent pour compatibilité avec les
 * documents déjà en base et les appels existants ; les nouveaux enregistrements les remplissent
 * en parallèle avec `entityType` / `entityId`.
 * Collection : media.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type MediaKind = 'image' | 'video';

/** Entité à laquelle le média est rattaché (une seule par document). */
export type MediaEntityType =
  | 'etablissement'
  | 'service'
  | 'city'
  | 'country';

@Schema({
  timestamps: true,
  collection: 'media',
})
export class Media {
  /** URL publique de lecture (MINIO_PUBLIC_URL + bucket + objectKey). */
  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ required: true, trim: true })
  bucket: string;

  /** Clé objet dans le bucket MinIO (ex. media/userId/uuid-nom.ext). */
  @Prop({ required: true, trim: true })
  objectKey: string;

  /** image | video — dérivé du type MIME au upload. */
  @Prop({ required: true, enum: ['image', 'video'] })
  type: MediaKind;

  @Prop({ required: false, trim: true })
  mimeType?: string;

  @Prop({ required: false, min: 0 })
  sizeBytes?: number;

  @Prop({ required: false, trim: true })
  originalFilename?: string;

  /** Propriétaire (même logique que Etablissement.prestataire). */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  prestataire: Types.ObjectId;

  /**
   * Type d’entité parente + id (schéma générique).
   * Pour établissement / ligne service, doit rester aligné avec `etablissementId` /
   * `etablissementServiceId` lorsque ces champs sont utilisés.
   */
  @Prop({
    required: false,
    enum: ['etablissement', 'service', 'city', 'country'],
  })
  entityType?: MediaEntityType;

  @Prop({ type: Types.ObjectId, required: false })
  entityId?: Types.ObjectId;

  /** Établissement parent (exclusif avec etablissementServiceId). */
  @Prop({ type: Types.ObjectId, ref: 'Etablissement', required: false })
  etablissementId?: Types.ObjectId;

  /** Ligne EtablissementService (service du catalogue rattaché à un établissement). */
  @Prop({ type: Types.ObjectId, ref: 'EtablissementService', required: false })
  etablissementServiceId?: Types.ObjectId;

  /**
   * Image de couverture dans le scope du parent (un seul `true` par entité parente
   * — géré dans MediaService).
   */
  @Prop({ required: true, default: false })
  isPrimary: boolean;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ prestataire: 1, createdAt: -1 });
MediaSchema.index({ etablissementId: 1 });
MediaSchema.index({ etablissementServiceId: 1 });
MediaSchema.index({ etablissementId: 1, isPrimary: 1 });
MediaSchema.index({ etablissementServiceId: 1, isPrimary: 1 });
MediaSchema.index({ entityType: 1, entityId: 1 });
MediaSchema.index({ entityType: 1, entityId: 1, isPrimary: 1 });
