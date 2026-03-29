import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsMongoId, IsOptional } from 'class-validator';

/**
 * Champs formulaire (multipart) en plus du fichier `file` (ou `files` en lot).
 * Parent au choix (contrôlé dans MediaService) :
 * - soit `etablissementId` xor `etablissementServiceId`
 * - soit `entityType` = city | country avec `entityId`
 */
export class UploadMediaDto {
  @IsOptional()
  @IsMongoId()
  etablissementId?: string;

  @IsOptional()
  @IsMongoId()
  etablissementServiceId?: string;

  @IsOptional()
  @IsIn(['city', 'country'])
  entityType?: 'city' | 'country';

  @IsOptional()
  @IsMongoId()
  entityId?: string;

  /** "true" / true : image principale (images uniquement ; un seul par lot si upload multiple). */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  isPrimary?: boolean;
}
