import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
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
 * Création d’utilisateur par un administrateur (POST /users).
 * Le mot de passe est hashé côté serveur ; jamais renvoyé dans les réponses.
 */
export class AdminCreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  prenom: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).*$/, {
    message:
      'Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(ROLE_VALUES)
  role: (typeof ROLE_VALUES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string;

  /** Si omis, le compte est créé actif (`true`). */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
