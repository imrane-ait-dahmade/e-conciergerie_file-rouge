import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Production-ready Signup DTO for authentication.
 *
 * Validation choices:
 * - nom/prenom: Not empty, trimmed strings. MinLength(2) prevents trivial/single-char names.
 * - email: RFC-compliant format via IsEmail. Prevents invalid or malformed emails.
 * - password: Strong rules to meet common security standards and reduce brute-force risk.
 * - telephone/adresse: Optional; IsString when provided avoids type confusion.
 */
export class SignupDto {
  @ApiProperty({ example: 'Dupont', minLength: 2, maxLength: 100 })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères' })
  nom: string;

  @ApiProperty({ example: 'Jean', minLength: 2, maxLength: 100 })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le prénom ne doit pas dépasser 100 caractères' })
  prenom: string;

  @ApiProperty({ example: 'jean.dupont@example.com', maxLength: 255 })
  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "L'email doit être une adresse email valide" })
  @MaxLength(255, { message: "L'email ne doit pas dépasser 255 caractères" })
  email: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    minLength: 8,
    maxLength: 128,
    description: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char',
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(128, { message: 'Le mot de passe ne doit pas dépasser 128 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).*$/,
    {
      message:
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    },
  )
  password: string;

  @ApiProperty({ example: '+33612345678', required: false, maxLength: 20 })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'Le téléphone ne doit pas dépasser 20 caractères' })
  telephone?: string;

  @ApiProperty({ example: '123 Rue Example', required: false, maxLength: 500 })
  @IsOptional()
  @IsString({ message: "L'adresse doit être une chaîne de caractères" })
  @MaxLength(500, { message: "L'adresse ne doit pas dépasser 500 caractères" })
  adresse?: string;
}
