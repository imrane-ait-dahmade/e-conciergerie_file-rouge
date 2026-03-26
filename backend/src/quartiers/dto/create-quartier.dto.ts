import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateQuartierDto {
  @ApiProperty({ example: 'Plateau' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(200)
  nom: string;

  @ApiProperty({ description: 'Identifiant Mongo de la ville' })
  @IsNotEmpty({ message: 'La ville est requise' })
  @IsMongoId({ message: 'Identifiant ville invalide' })
  ville: string;
}
