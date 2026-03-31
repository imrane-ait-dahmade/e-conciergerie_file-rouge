import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * Corps POST /sliders (équivalent Laravel Form Request « StoreSliderRequest »).
 * Champs en snake_case pour alignement front/mobile.
 * Ordre des dates : vérifié dans SliderService (create + update partiel).
 */
export class StoreSliderRequest {
  @ApiProperty({ example: 'Bienvenue' })
  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({ example: 'Événement' })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(80)
  badge?: string | null;

  @ApiProperty({ description: 'URL ou chemin de l’image' })
  @IsNotEmpty({ message: 'L’image est requise' })
  @IsString()
  @MaxLength(2048)
  picture: string;

  @ApiPropertyOptional({ example: '#1a1a1a' })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(50)
  color?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(200)
  button_text?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(2048)
  button_link?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @Type(() => Date)
  @IsDate()
  starts_at?: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @Type(() => Date)
  @IsDate()
  ends_at?: Date | null;
}
