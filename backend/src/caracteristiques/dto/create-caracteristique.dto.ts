import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCaracteristiqueDto {
  @ApiProperty({ example: 'Wi-Fi' })
  @IsNotEmpty({ message: 'Le libellé est requis' })
  @IsString()
  @MaxLength(200)
  libelle: string;

  @ApiProperty({ example: 'Gratuit' })
  @IsNotEmpty({ message: 'La valeur est requise' })
  @IsString()
  @MaxLength(500)
  valeur: string;

  @ApiPropertyOptional({ description: 'ObjectId du service (optionnel)' })
  @IsOptional()
  @IsMongoId({ message: 'Identifiant service invalide' })
  service?: string;

  @ApiPropertyOptional({ description: 'ObjectId de l’établissement (optionnel)' })
  @IsOptional()
  @IsMongoId({ message: 'Identifiant établissement invalide' })
  etablissement?: string;
}
