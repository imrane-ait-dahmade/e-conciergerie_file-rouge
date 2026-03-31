import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum ServicesSearchSort {
  RELEVANCE = 'relevance',
  RATING_DESC = 'rating_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

/** Query GET /services/search */
export class ServicesSearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Mot-clé (service, établissement, adresse, commentaire)',
    maxLength: 120,
    example: 'spa',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par domaine métier (ObjectId domaine)',
    example: '65f0f9aa2c3b4d0f12345678',
  })
  @IsOptional()
  @IsMongoId()
  domainId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par ville (ObjectId ville)',
    example: '65f0f9aa2c3b4d0f87654321',
  })
  @IsOptional()
  @IsMongoId()
  cityId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par nom de ville (insensible à la casse)',
    maxLength: 120,
    example: 'Marrakech',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Prix minimum' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Prix maximum' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 5,
    description: 'Note minimale établissement',
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    enum: ServicesSearchSort,
    default: ServicesSearchSort.RELEVANCE,
  })
  @IsOptional()
  @IsEnum(ServicesSearchSort)
  sort?: ServicesSearchSort;
}
