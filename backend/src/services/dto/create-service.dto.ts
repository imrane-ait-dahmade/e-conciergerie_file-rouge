import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Chambre double' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(200)
  nom: string;

  @ApiPropertyOptional({ example: 'Vue mer, petit-déjeuner inclus' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ description: 'ObjectId de l’établissement' })
  @IsMongoId({ message: 'Identifiant établissement invalide' })
  etablissement: string;

  @ApiProperty({ description: 'ObjectId du domaine (doit exister en base)' })
  @IsMongoId({ message: 'Identifiant domaine invalide' })
  domaine: string;
}
