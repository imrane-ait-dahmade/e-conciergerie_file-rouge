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

/** Query GET /mobile/recommendation-establishment-services */
export class MobileNearbyRecommendationQueryDto {
  @ApiProperty({ example: 33.5731, description: 'WGS84 latitude' })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -7.5898, description: 'WGS84 longitude' })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({
    description: 'Rayon maximal en mètres (défaut 50 km, max 500 km)',
    example: 50_000,
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
}
