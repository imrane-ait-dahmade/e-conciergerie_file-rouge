import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePaysDto {
  @ApiProperty({ example: 'Sénégal' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(200)
  nom: string;

  @ApiPropertyOptional({ example: 'SN' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;
}
