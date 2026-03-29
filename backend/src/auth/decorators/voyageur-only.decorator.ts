import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleName } from '../constants/role-names';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Routes réservées au **voyageur** (rôle stocké en base sous le nom `client`).
 *
 * @example
 * \@ApiBearerAuth()
 * \@VoyageurOnly()
 * \@Controller('me/reservations')
 */
export function VoyageurOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.Voyageur),
  );
}
