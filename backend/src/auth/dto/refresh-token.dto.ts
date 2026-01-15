import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token received from login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Le refresh token est requis' })
  @IsString({ message: 'Le refresh token doit être une chaîne de caractères' })
  @MaxLength(500, { message: 'Le refresh token est invalide' })
  refreshToken: string;
}
