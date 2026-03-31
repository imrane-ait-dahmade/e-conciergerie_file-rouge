import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * Mise à jour partielle (admin). Géolocalisation : paire lat/lng ; Point GeoJSON synchronisé par Mongoose.
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

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string;

  @ApiPropertyOptional({
    description: 'Alias de `adresse` ; si les deux sont fournis, `adresse` est conservé',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf(
    (o) => o.latitude !== null && o.latitude !== undefined,
  )
  @IsLatitude()
  @Type(() => Number)
  latitude?: number | null;

  @ApiPropertyOptional()
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
