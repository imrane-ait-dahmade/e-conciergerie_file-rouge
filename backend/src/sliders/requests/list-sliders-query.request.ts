import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/** Query GET /sliders (pagination + filtres admin). */
export class ListSlidersQueryRequest extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par statut actif (true/false)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '' || value === null) {
      return undefined;
    }
    if (value === true || value === 'true' || value === '1') {
      return true;
    }
    if (value === false || value === 'false' || value === '0') {
      return false;
    }
    return value;
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Recherche insensible à la casse sur le titre',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
