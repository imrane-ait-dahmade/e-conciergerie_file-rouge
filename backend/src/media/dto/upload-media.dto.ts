import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

/**
 * Champs formulaire (multipart) en plus du fichier `file` (ou `files` en lot).
 * Exactement un des deux identifiants parent doit être fourni (contrôlé dans MediaService).
 */
export class UploadMediaDto {
  @IsOptional()
  @IsMongoId()
  etablissementId?: string;

  @IsOptional()
  @IsMongoId()
  etablissementServiceId?: string;

  /** "true" / true : image principale (images uniquement ; un seul par lot si upload multiple). */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  isPrimary?: boolean;
}
