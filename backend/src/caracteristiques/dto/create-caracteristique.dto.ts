import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCaracteristiqueDto {
  @ApiProperty({ example: 'Wi-Fi' })
  @IsNotEmpty({ message: 'Le libellé est requis' })
  @IsString()
  @MaxLength(200)
  libelle: string;

  @ApiPropertyOptional({
    description: 'Clé d’icône (wifi, parking-circle, …) ou URL — optionnel',
    example: 'wifi',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(512)
  icon?: string;

  @ApiPropertyOptional({ description: 'ObjectId du service (optionnel)' })
  @IsOptional()
  @IsMongoId({ message: 'Identifiant service invalide' })
  service?: string;
}
