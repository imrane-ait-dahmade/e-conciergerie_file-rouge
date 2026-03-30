import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Hôtelier' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(200)
  nom: string;

  @ApiPropertyOptional({ example: 'Offres liées aux hôtels et résidences hôtelières' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Clé d’icône (hotel, home, …) ou URL — optionnel',
    example: 'hotel',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(512)
  icon?: string;

  @ApiProperty({ description: 'ObjectId du domaine (ex. hébergement, restauration)' })
  @IsMongoId({ message: 'Identifiant domaine invalide' })
  domaine: string;
}
