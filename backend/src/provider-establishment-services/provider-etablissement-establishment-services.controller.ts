import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderEstablishmentServicesService } from './provider-establishment-services.service';

/**
 * Route dédiée : assignations pour un établissement précis (même préfixe que
 * `provider/etablissements`, autre contrôleur — Nest fusionne les routes).
 */
@ApiTags('Provider — establishment services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('prestataire')
@Controller('provider/etablissements')
export class ProviderEtablissementEstablishmentServicesController {
  constructor(
    private readonly providerEstablishmentServicesService: ProviderEstablishmentServicesService,
  ) {}

  @Get(':etablissementId/services')
  @ApiOperation({
    summary: 'Lister les services assignés à un de mes établissements',
  })
  findByEtablissement(
    @Param('etablissementId') etablissementId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEstablishmentServicesService.findByEtablissementForProvider(
      etablissementId,
      userId,
    );
  }
}
