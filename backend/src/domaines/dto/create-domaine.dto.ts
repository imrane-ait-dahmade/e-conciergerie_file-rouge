import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

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

  @ApiPropertyOptional({
    description:
      'Clé d’icône pour les apps (ex. bed, plane, car, utensils, map, sparkles)',
    example: 'bed',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @ValidateIf((_, v) => v !== undefined && v !== null && v !== '')
  @Matches(/^[a-z0-9_-]+$/i, {
    message:
      'icon doit être une clé simple (lettres, chiffres, tirets ou underscores)',
  })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Slug stable (sinon dérivé du nom à la création)',
    example: 'hebergements',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ValidateIf((_, v) => v !== undefined && v !== null && v !== '')
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug doit être en minuscules, chiffres et tirets (ex. hebergements)',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Visible sur la Home mobile (défaut true)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Ordre d’affichage (croissant, 0 par défaut)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
