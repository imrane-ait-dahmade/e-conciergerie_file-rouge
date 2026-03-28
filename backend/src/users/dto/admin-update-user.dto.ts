import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ROLE_NAMES } from '../../roles/seeds/roles.seed';

const ROLE_VALUES = [
  ROLE_NAMES.ADMIN,
  ROLE_NAMES.PRESTATAIRE,
  ROLE_NAMES.CLIENT,
] as const;

/**
 * Mise à jour partielle (PATCH /users/:id). Seuls les champs fournis sont modifiés.
 */
export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  prenom?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).*$/, {
    message:
      'Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @IsIn(ROLE_VALUES)
  role?: (typeof ROLE_VALUES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string;
}
