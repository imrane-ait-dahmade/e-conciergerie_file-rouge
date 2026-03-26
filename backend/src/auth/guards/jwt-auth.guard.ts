import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Garde JWT : vérifie le token dans Authorization: Bearer <token>.
 *
 * LARAVEL : équivalent du middleware auth (auth:sanctum ou auth:api).
 *   Route::get('profile')->middleware('auth');
 *
 * FONCTIONNEMENT :
 * 1. Extrait le token de l'en-tête
 * 2. JwtStrategy le valide (signature, expiration)
 * 3. Si OK : met req.user = { userId, email } et laisse passer
 * 4. Si KO : lance 401 Unauthorized
 *
 * Utilisation : @UseGuards(JwtAuthGuard) sur les routes protégées.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
  ): TUser {
    if (err) {
      throw err instanceof Error ? err : new UnauthorizedException(String(err));
    }
    if (!user) {
      const message =
        info instanceof Error ? info.message : 'Token invalide ou expiré';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
