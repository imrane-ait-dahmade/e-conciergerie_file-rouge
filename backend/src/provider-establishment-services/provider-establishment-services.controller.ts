import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateEtablissementServiceDto } from '../etablissement-services/dto/create-etablissement-service.dto';
import { UpdateEtablissementServiceDto } from '../etablissement-services/dto/update-etablissement-service.dto';
import { ProviderEstablishmentServicesService } from './provider-establishment-services.service';

/**
 * Liaisons catalogue `Service` ↔ établissement du prestataire connecté.
 * Le catalogue `/services` reste géré côté admin ; ici on ne fait qu’assigner et paramétrer.
 */
@ApiTags('Provider — establishment services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('prestataire')
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
