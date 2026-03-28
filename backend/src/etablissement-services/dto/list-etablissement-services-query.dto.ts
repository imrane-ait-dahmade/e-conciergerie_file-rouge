import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/** Liste paginée ; filtre optionnel par établissement. */
export class ListEtablissementServicesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Ne retourner que les assignations pour cet établissement',
  })
  @IsOptional()
  @IsMongoId({ message: 'Identifiant établissement invalide' })
  etablissementId?: string;
}
