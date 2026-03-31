import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

/** Query GET /mobile/recommendation-establishment-services/grouped */
export class MobileNearbyGroupedRecommendationQueryDto {
  @ApiProperty({ example: 33.5731 })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -7.5898 })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({
    description: 'Rayon maximal en mètres (défaut 50 km, max 500 km)',
    minimum: 100,
    maximum: 500_000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(500_000)
  maxDistance?: number;

  @ApiPropertyOptional({
    description: 'Nombre max d’offres par domaine (défaut 5, max 20)',
    default: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limitPerGroup?: number;
}
