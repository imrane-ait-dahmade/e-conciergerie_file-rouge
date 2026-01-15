import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Vérifie que l'utilisateur connecté a un des rôles requis.
 * À placer APRÈS JwtAuthGuard (pour que req.user existe).
 *
 * Laravel équivalent : Gate::authorize() ou middleware hasRole.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lit les rôles déclarés sur la route avec @Roles('admin', 'moderator')
    const rolesRequis = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequis?.length) {
      return true; // Pas de @Roles() = pas de vérification de rôle
    }

    const request = context.switchToHttp().getRequest();
    const userConnecte = request.user; // { userId, email } mis par JwtAuthGuard

    if (!userConnecte?.userId) {
      throw new ForbiddenException('Accès refusé');
    }

    // Récupère l'utilisateur en base avec son rôle (User.role → collection Role)
    const userEnBase = await this.userModel
      .findById(userConnecte.userId)
      .populate<{ role: { name: string } | null }>('role')
      .select('role')
      .lean();

    const nomDuRole = userEnBase?.role && typeof userEnBase.role === 'object' && 'name' in userEnBase.role
      ? (userEnBase.role as { name: string }).name
      : null;

    const aLeBonRole = nomDuRole && rolesRequis.includes(nomDuRole);

    if (!aLeBonRole) {
      throw new ForbiddenException('Vous n\'avez pas les autorisations nécessaires');
    }

    return true;
  }
}
