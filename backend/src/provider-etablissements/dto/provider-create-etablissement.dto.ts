import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Création par le prestataire connecté : le champ `prestataire` est fixé côté serveur (JWT).
 */
export class ProviderCreateEtablissementDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nom: string;

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

  /** URL ou clé ; pas d’upload dans ce flux. */
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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
