import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListQuartiersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par ville (Mongo ObjectId)' })
  @IsOptional()
  @IsMongoId()
  cityId?: string;
}
