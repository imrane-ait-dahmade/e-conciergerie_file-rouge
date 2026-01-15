import { SetMetadata } from '@nestjs/common';

// Clé lue par JwtAuthGuard pour savoir si la route est publique
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marque une route comme publique (pas de token JWT requis).
 * Utile quand JwtAuthGuard est appliqué globalement.
 *
 * Laravel équivalent : route exclue du middleware auth.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
