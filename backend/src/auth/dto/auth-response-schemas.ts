import { ApiProperty } from '@nestjs/swagger';

/** Swagger schema for login and refresh-token responses */
export class LoginResponseSchema {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: '507f1f77bcf86cd799439011',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      role: null,
      isActive: true,
      emailVerified: true,
      authProvider: 'local',
    },
  })
  user: object;
}

/** Swagger schema for signup response */
export class SignupResponseSchema {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Dupont' })
  nom: string;

  @ApiProperty({ example: 'Jean' })
  prenom: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  email: string;

  @ApiProperty({
    example: 'Compte créé. Un email de vérification vous a été envoyé.',
  })
  message: string;
}

/** Swagger schema for verify-email response */
export class VerifyEmailResponseSchema {
  @ApiProperty({ example: 'Votre email a été vérifié avec succès' })
  message: string;

  @ApiProperty({ example: true })
  emailVerified: boolean;
}

/** Swagger schema for forgot-password and logout responses */
export class MessageResponseSchema {
  @ApiProperty({
    example:
      'Si cet email est enregistré, vous recevrez un lien de réinitialisation.',
  })
  message: string;
}
