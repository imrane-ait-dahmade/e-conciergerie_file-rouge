import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Assignation d’un service du catalogue à un établissement.
 * Les champs métier optionnels viennent du schéma : prix, commentaire.
 */
export class CreateEtablissementServiceDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'Identifiant établissement invalide' })
  etablissement: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'Identifiant service (catalogue) invalide' })
  service: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prix?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  commentaire?: string;
}
