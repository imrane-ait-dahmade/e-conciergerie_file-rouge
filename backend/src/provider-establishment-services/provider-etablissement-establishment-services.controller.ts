import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderOnly } from '../auth/decorators/provider-only.decorator';
import { ProviderEstablishmentServicesService } from './provider-establishment-services.service';

/**
 * Route dédiée : assignations pour un établissement précis (même préfixe que
 * `provider/etablissements`, autre contrôleur — Nest fusionne les routes).
 */
@ApiTags('Provider — establishment services')
@ApiBearerAuth()
@ProviderOnly()
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
