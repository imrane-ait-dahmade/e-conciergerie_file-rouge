import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderOnly } from '../auth/decorators/provider-only.decorator';
import { CreateEtablissementServiceDto } from '../etablissement-services/dto/create-etablissement-service.dto';
import { UpdateEtablissementServiceDto } from '../etablissement-services/dto/update-etablissement-service.dto';
import { ProviderEstablishmentServicesService } from './provider-establishment-services.service';

/**
 * Liaisons catalogue `Service` ↔ établissement du prestataire connecté.
 * Le catalogue `/services` reste géré côté admin ; ici on ne fait qu’assigner et paramétrer.
 */
@ApiTags('Provider — establishment services')
@ApiBearerAuth()
@ProviderOnly()
@Controller('provider/establishment-services')
export class ProviderEstablishmentServicesController {
  constructor(
    private readonly providerEstablishmentServicesService: ProviderEstablishmentServicesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lister toutes mes assignations (tous mes établissements)',
  })
  findAll(@CurrentUser('userId') userId: string) {
    return this.providerEstablishmentServicesService.findAllForProvider(userId);
  }

  @Post()
  @ApiOperation({
    summary:
      'Assigner un service du catalogue à un de mes établissements (prix / commentaire optionnels)',
  })
  create(
    @Body() dto: CreateEtablissementServiceDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEstablishmentServicesService.createForProvider(
      dto,
      userId,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour prix / commentaire sur une assignation m’appartenant',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEtablissementServiceDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEstablishmentServicesService.updateForProvider(
      id,
      dto,
      userId,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Retirer un service d’un de mes établissements' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.providerEstablishmentServicesService.removeForProvider(id, userId);
  }
}
