import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Mise à jour des métadonnées sur la liaison (pas de changement d’établissement / de service ici :
 * supprimer l’assignation et en créer une autre si besoin).
 */
export class UpdateEtablissementServiceDto {
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
