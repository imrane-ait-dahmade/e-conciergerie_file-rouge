import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * Assignation d’un service du catalogue à un établissement (admin).
 * Géolocalisation optionnelle : `latitude` / `longitude` toujours par paire (validé aussi côté service).
 * Le Point GeoJSON est dérivé automatiquement par le middleware Mongoose.
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

  @ApiPropertyOptional({
    description: 'Adresse textuelle du lieu d’exécution (schéma Mongo : adresse)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string;

  @ApiPropertyOptional({
    description:
      'Alias de `adresse` pour les clients qui envoient `address` ; si `adresse` est aussi envoyé, `adresse` prime',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'WGS84 — uniquement avec `longitude`' })
  @IsOptional()
  @ValidateIf(
    (o) => o.latitude !== null && o.latitude !== undefined,
  )
  @IsLatitude()
  @Type(() => Number)
  latitude?: number | null;

  @ApiPropertyOptional({ description: 'WGS84 — uniquement avec `latitude`' })
  @IsOptional()
  @ValidateIf(
    (o) => o.longitude !== null && o.longitude !== undefined,
  )
  @IsLongitude()
  @Type(() => Number)
  longitude?: number | null;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location_label?: string;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location_type?: string;
}
