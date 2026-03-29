import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleName } from '../constants/role-names';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Routes réservées aux **prestataires** (JWT valide + rôle `prestataire`).
 * Les accès aux données se font toujours avec le `userId` du token + filtres / ownership en service.
 *
 * @example
 * \@ApiBearerAuth()
 * \@ProviderOnly()
 * \@Controller('provider/etablissements')
 */
export function ProviderOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.Prestataire),
  );
}
