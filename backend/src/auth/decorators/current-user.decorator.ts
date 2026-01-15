import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../jwt.strategy';

/**
 * Récupère l'utilisateur connecté depuis req.user.
 * Laravel équivalent : Auth::user() ou Auth::id()
 *
 * À utiliser avec @UseGuards(JwtAuthGuard).
 *
 * Exemples :
 *   @CurrentUser() user        → { userId, email }
 *   @CurrentUser('userId') id  → string (l'id uniquement)
 */
export const CurrentUser = createParamDecorator(
  (propriete: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    if (propriete) {
      return user?.[propriete] ?? null;
    }
    return user;
  },
);
