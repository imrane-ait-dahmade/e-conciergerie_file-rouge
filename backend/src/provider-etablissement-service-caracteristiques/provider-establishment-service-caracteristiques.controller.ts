import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProviderEtablissementServiceCaracteristiqueDto } from './dto/create-provider-etablissement-service-caracteristique.dto';
import { ProviderEtablissementServiceCaracteristiquesService } from './provider-etablissement-service-caracteristiques.service';

/**
 * Sous-ressource : caractéristiques d’une offre (`EtablissementService`), préfixe
 * identique à `provider/establishment-services` (autre contrôleur).
 */
@ApiTags('Provider — caractéristiques d’offre')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('prestataire')
@Controller('provider/establishment-services')
export class ProviderEstablishmentServiceCaracteristiquesController {
  constructor(
    private readonly providerEscService: ProviderEtablissementServiceCaracteristiquesService,
  ) {}

  @Get(':id/caracteristiques')
  @ApiOperation({
    summary:
      'Lister les caractéristiques (lignes libellé/valeur) pour une de mes offres',
  })
  findAll(
    @Param('id') establishmentServiceId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEscService.findAllForEstablishmentService(
      establishmentServiceId,
      userId,
    );
  }

  @Post(':id/caracteristiques')
  @ApiOperation({
    summary:
      'Ajouter une caractéristique sur une de mes offres (libellé libre ou référence catalogue)',
  })
  create(
    @Param('id') establishmentServiceId: string,
    @Body() dto: CreateProviderEtablissementServiceCaracteristiqueDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEscService.createForEstablishmentService(
      establishmentServiceId,
      dto,
      userId,
    );
  }
}
