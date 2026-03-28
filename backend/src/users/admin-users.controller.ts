import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { RequestUser } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AdminUsersService } from './admin-users.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

/**
 * CRUD administrateur sur les utilisateurs.
 * Toutes les routes exigent un JWT valide + rôle `admin`.
 *
 * Le contrôleur `UsersController` doit être enregistré **avant** celui-ci dans le module
 * pour que `GET /users/profile` ne soit pas capturé par `GET /users/:id`.
 */
@ApiTags('Users (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les utilisateurs (paginé)' })
  @ApiResponse({ status: 200, description: 'Liste sans mots de passe' })
  list(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un utilisateur (avec profil de rôle)" })
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un utilisateur (rôle + profil associé)' })
  create(@Body() dto: AdminCreateUserDto) {
    return this.adminUsersService.create(dto);
  }

  /** Route plus spécifique avant PATCH :id pour éviter les conflits de chemin. */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Activer ou désactiver un compte' })
  patchStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.adminUsersService.updateStatus(id, dto, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur (partiel)' })
  update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminUsersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un utilisateur (si aucune donnée métier liée)',
  })
  remove(@Param('id') id: string, @Req() req: { user: RequestUser }) {
    return this.adminUsersService.remove(id, req.user.userId);
  }
}
