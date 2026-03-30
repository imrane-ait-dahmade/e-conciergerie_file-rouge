import { ApiProperty } from '@nestjs/swagger';

/** Réponse enveloppée : utiliser `MobileDomainDetailsData` côté code ; ce DTO sert à Swagger. */
export class MobileDomainDetailsDomainDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ nullable: true })
  icon: string | null;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true, description: 'Réservé extension (bannière domaine)' })
  image: string | null;
}

export class MobileDomainDetailsServiceItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ nullable: true })
  icon: string | null;

  @ApiProperty()
  domainId: string;
}

export class MobileDomainDetailsItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  image: string | null;

  @ApiProperty()
  locationLabel: string;

  @ApiProperty({ nullable: true })
  priceLabel: string | null;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  establishmentName: string;

  @ApiProperty()
  domainId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  isFeatured: boolean;
}

export class MobileDomainDetailsPayloadDto {
  @ApiProperty({ type: MobileDomainDetailsDomainDto })
  domain: MobileDomainDetailsDomainDto;

  @ApiProperty({ type: [MobileDomainDetailsServiceItemDto] })
  services: MobileDomainDetailsServiceItemDto[];

  @ApiProperty({ type: [MobileDomainDetailsItemDto] })
  items: MobileDomainDetailsItemDto[];
}
