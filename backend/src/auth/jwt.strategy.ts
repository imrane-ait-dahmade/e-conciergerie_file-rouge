import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Objet mis dans req.user après validation JWT.
 * Laravel : ce que retourne Auth::user() (userId = Auth::id()).
 */
export interface RequestUser {
  userId: string;
  email: string;
}

/**
 * JwtStrategy : valide le token JWT et remplit req.user.
 *
 * FONCTIONNEMENT :
 * 1. Passport extrait le token de Authorization: Bearer <token>
 * 2. Vérifie la signature avec JWT_SECRET
 * 3. Appelle validate() avec le payload décodé
 * 4. Le retour de validate() est mis dans req.user
 *
 * Si le token est invalide/expiré → Passport lance une erreur → Guard retourne 401.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  /**
   * Appelé par Passport après vérification de la signature.
   * Retourne l'objet qui sera mis dans req.user.
   */
  async validate(payload: {
    sub?: string;
    email?: string;
    type?: string;
  }): Promise<RequestUser> {
    // Refuser les refresh tokens (ils ne doivent pas être utilisés en Bearer)
    if (payload.type === 'refresh') {
      throw new UnauthorizedException(
        "Token invalide. Utilisez un token d'accès.",
      );
    }

    const userId = payload?.sub;
    const email = payload?.email;

    if (
      !userId ||
      !email ||
      typeof userId !== 'string' ||
      typeof email !== 'string'
    ) {
      throw new UnauthorizedException('Payload de token invalide');
    }

    return {
      userId,
      email,
    };
  }
}
