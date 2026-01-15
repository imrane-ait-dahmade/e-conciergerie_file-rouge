import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "L'email doit être une adresse email valide" })
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MaxLength(128, { message: 'Le mot de passe est invalide' })
  password: string;
}
