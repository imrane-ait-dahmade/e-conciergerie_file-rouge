import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Verification token from signup email', example: 'a1b2c3d4e5f6...' })
  @IsNotEmpty({ message: 'Le token de vérification est requis' })
  @IsString({ message: 'Le token doit être une chaîne de caractères' })
  @MaxLength(200, { message: 'Le token est invalide' })
  token: string;
}
