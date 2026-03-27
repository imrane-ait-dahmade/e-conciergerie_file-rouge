import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListVillesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par pays (Mongo ObjectId)' })
  @IsOptional()
  @IsMongoId()
  countryId?: string;
}
