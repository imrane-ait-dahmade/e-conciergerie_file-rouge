import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCaracteristiqueDto {
  @ApiProperty({ example: 'Wi-Fi' })
  @IsNotEmpty({ message: 'Le libellé est requis' })
  @IsString()
  @MaxLength(200)
  libelle: string;

  @ApiPropertyOptional({ description: 'ObjectId du service (optionnel)' })
  @IsOptional()
  @IsMongoId({ message: 'Identifiant service invalide' })
  service?: string;
}
