import { ApiPropertyOptional } from '@nestjs/swagger';
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

/**
 * Query GET /map/nearby — mêmes règles que GET /services/nearby (géoloc + rayon + domaine).
 */
export class MapNearbyQueryDto {
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  lng: number;

  @ApiPropertyOptional({
    description: 'Nombre max de résultats (défaut 30, max 100)',
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Rayon en km (défaut 50, max 500)',
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(500)
  radiusKm?: number;

  @ApiPropertyOptional({ description: 'Filtrer par domaine (ObjectId)' })
  @IsOptional()
  @IsMongoId()
  domainId?: string;
}
