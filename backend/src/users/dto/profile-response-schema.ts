import { ApiProperty } from '@nestjs/swagger';

/** Swagger schema for profile response */
export class ProfileResponseSchema {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Dupont' })
  nom: string;

  @ApiProperty({ example: 'Jean' })
  prenom: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  email: string;

  @ApiProperty({ example: '+33612345678', required: false })
  telephone?: string;

  @ApiProperty({ example: '123 Rue Example', required: false })
  adresse?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}
