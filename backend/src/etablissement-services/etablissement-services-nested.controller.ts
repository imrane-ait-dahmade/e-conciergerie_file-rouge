import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { EtablissementServicesService } from './etablissement-services.service';

/**
 * Route dédiée : tous les services assignés à un établissement donné.
 * Chemin : GET /etablissements/:etablissementId/services
 * (ne entre pas en conflit avec GET /etablissements/:id qui n’a que 2 segments).
 */
@ApiTags('Etablissement-services (admin)')
@ApiBearerAuth()
@AdminOnly()
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
