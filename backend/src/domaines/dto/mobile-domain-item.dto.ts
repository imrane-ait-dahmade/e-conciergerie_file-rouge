import { ApiProperty } from '@nestjs/swagger';

/**
 * Domaine exposé sur la Home mobile (liste filtrée / triée côté service).
 */
export class MobileDomainItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Hébergements' })
  name: string;

  @ApiProperty({
    example: 'hebergements',
    description: 'Persisté en base ou dérivé du nom si absent',
  })
  slug: string;

  @ApiProperty({
    example: 'bed',
    nullable: true,
    description: 'Clé d’icône (Ionicons / mapping app)',
  })
  icon: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1, description: 'Ordre d’affichage croissant' })
  order: number;
}
