import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

/**
 * Création d’établissement par un administrateur.
 * Le prestataire propriétaire est obligatoire (référence User avec rôle prestataire).
 */
export class AdminCreateEtablissementDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nom: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'Identifiant prestataire invalide' })
  prestataire: string;

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

  /** URL ou clé existante ; pas d’upload dans ce flux. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets',
  })
  slug?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  averageRating?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  reviewCount?: number;

  @IsOptional()
  @IsBoolean()
  isFeaturedForHomeBestProviders?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  bestProviderSortOrder?: number;

  @IsOptional()
  @IsMongoId({ message: 'Identifiant domaine invalide' })
  domaine?: string;

  /** Nation = Pays dans le schéma. */
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
