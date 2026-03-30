import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

/**
 * Query optionnelle pour GET /mobile/domains/:domainId/details.
 * Filtre les `items` sur un sous-service (catalogue `Service`) sans recharger les onglets côté client.
 */
export class MobileDomainDetailsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer les offres sur cet id de service catalogue (sous-service)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  serviceId?: string;
}
