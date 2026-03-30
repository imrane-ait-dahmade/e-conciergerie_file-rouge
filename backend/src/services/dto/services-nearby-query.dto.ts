import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

/** Query GET /services/nearby */
export class ServicesNearbyQueryDto {
  @ApiProperty({ example: 33.5731, description: 'Latitude WGS84' })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: -7.5898, description: 'Longitude WGS84' })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  lng: number;

  @ApiPropertyOptional({
    description: 'Nombre max de résultats (défaut 20, max 100)',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Rayon de recherche en kilomètres (défaut 50, max 500)',
    default: 50,
    minimum: 0.1,
    maximum: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(500)
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par domaine métier (ObjectId du domaine)',
  })
  @IsOptional()
  @IsMongoId()
  domainId?: string;
}
