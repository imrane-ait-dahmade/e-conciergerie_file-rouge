import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDomaineDto {
  @ApiProperty({ example: 'Hôtellerie' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(200)
  nom: string;

  @ApiPropertyOptional({ example: 'Hébergement et services associés' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
