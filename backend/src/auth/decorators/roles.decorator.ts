import { SetMetadata } from '@nestjs/common';

// Clé utilisée pour stocker les rôles requis (lue par RolesGuard).
// Équivalent Laravel : vérification manuelle Auth::user()->hasRole('admin')
const ROLES_KEY = 'roles';

/**
 * Indique qu'une route nécessite un des rôles listés.
 * À utiliser avec @UseGuards(JwtAuthGuard, RolesGuard).
 *
 * Exemple :
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin')
 *   @Delete(':id')
 *   deleteUser(@Param('id') id: string) { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Export pour RolesGuard qui doit lire cette clé
export { ROLES_KEY };
