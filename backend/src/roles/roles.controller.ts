import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';

/**
 * Liste des rôles (utile pour les formulaires admin ou le front).
 * Les routes de création / modification peuvent être ajoutées plus tard avec un garde @Roles('admin').
 */
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les rôles' })
  findAll() {
    return this.rolesService.findAll();
  }
}
