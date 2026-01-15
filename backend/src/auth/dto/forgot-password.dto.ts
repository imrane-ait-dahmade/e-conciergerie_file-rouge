import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "L'email doit être une adresse email valide" })
  @MaxLength(255, { message: "L'email ne doit pas dépasser 255 caractères" })
  email: string;
}
