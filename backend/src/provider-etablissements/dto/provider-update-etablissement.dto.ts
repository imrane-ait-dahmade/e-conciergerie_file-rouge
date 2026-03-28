import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Mise à jour partielle : le propriétaire (`prestataire`) ne peut pas être modifié.
 * Pour activer/désactiver, utiliser PATCH …/status.
 */
export class ProviderUpdateEtablissementDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @IsOptional()
  @IsMongoId({ message: 'Identifiant domaine invalide' })
  domaine?: string;

  @IsOptional()
  @IsMongoId({ message: 'Identifiant pays invalide' })
  pays?: string;

  @IsOptional()
  @IsMongoId({ message: 'Identifiant ville invalide' })
  ville?: string;

  @IsOptional()
  @IsMongoId({ message: 'Identifiant quartier invalide' })
  quartier?: string;
}
