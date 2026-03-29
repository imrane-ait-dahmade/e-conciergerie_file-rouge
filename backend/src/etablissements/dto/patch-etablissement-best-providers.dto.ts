import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

/**
 * Corps PATCH /admin/etablissements/:id/best-providers — champs Best providers uniquement.
 * Au moins un champ requis (validé dans le service).
 */
export class PatchEtablissementBestProvidersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeaturedForHomeBestProviders?: boolean;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  bestProviderSortOrder?: number;
}
