import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleName } from '../constants/role-names';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Routes réservées aux **administrateurs** (JWT + rôle `admin`).
 *
 * @example
 * \@ApiBearerAuth()
 * \@AdminOnly()
 * \@Controller('admin/etablissements')
 */
export function AdminOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.Admin),
  );
}
