import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * Query GET /admin/etablissements — filtres optionnels (équivalent Form Request).
 */
export class ListAdminEtablissementsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par visibilité (actif / inactif)' })
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
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer les établissements mis en avant (section accueil Best providers)',
  })
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
  isFeaturedForHomeBestProviders?: boolean;

  @ApiPropertyOptional({ description: 'Recherche insensible à la casse sur le nom' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
