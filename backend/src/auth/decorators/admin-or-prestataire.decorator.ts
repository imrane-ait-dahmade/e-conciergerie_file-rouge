import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleName } from '../constants/role-names';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * L’utilisateur doit être **admin** ou **prestataire** (l’un ou l’autre).
 * Utile pour une future route partagée ; le comportement métier précis (ex. admin voit tout,
 * prestataire seulement ses données) reste dans le **service**.
 *
 * @example
 * \@ApiBearerAuth()
 * \@AdminOrPrestataire()
 * \@Get('shared-resource/:id')
 */
export function AdminOrPrestataire() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.Admin, RoleName.Prestataire),
  );
}
