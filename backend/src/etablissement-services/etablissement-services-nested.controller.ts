import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EtablissementServicesService } from './etablissement-services.service';

/**
 * Route dédiée : tous les services assignés à un établissement donné.
 * Chemin : GET /etablissements/:etablissementId/services
 * (ne entre pas en conflit avec GET /etablissements/:id qui n’a que 2 segments).
 */
@ApiTags('Etablissement-services (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('etablissements')
export class EtablissementServicesNestedController {
  constructor(
    private readonly etablissementServicesService: EtablissementServicesService,
  ) {}

  @Get(':etablissementId/services')
  @ApiOperation({
    summary: 'Lister les services assignés à cet établissement (non paginé)',
  })
  listForEtablissement(@Param('etablissementId') etablissementId: string) {
    return this.etablissementServicesService.findByEtablissement(
      etablissementId,
    );
  }
}
