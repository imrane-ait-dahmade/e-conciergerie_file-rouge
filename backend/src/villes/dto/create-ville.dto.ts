import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateVilleDto {
  @ApiProperty({ example: 'Dakar' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(200)
  nom: string;

  @ApiProperty({ description: 'Identifiant Mongo du pays' })
  @IsNotEmpty({ message: 'Le pays est requis' })
  @IsMongoId({ message: 'Identifiant pays invalide' })
  pays: string;
}
