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
  ValidateIf,
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
  @ValidateIf(
    (o) => o.latitude !== null && o.latitude !== undefined,
  )
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number | null;

  @IsOptional()
  @ValidateIf(
    (o) => o.longitude !== null && o.longitude !== undefined,
  )
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number | null;

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
