import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProviderEtablissementServiceCaracteristiqueDto } from './dto/update-provider-etablissement-service-caracteristique.dto';
import { ProviderEtablissementServiceCaracteristiquesService } from './provider-etablissement-service-caracteristiques.service';

@ApiTags('Provider — caractéristiques d’offre')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('prestataire')
@Controller('provider/establishment-service-caracteristiques')
export class ProviderEtablissementServiceCaracteristiquesIdController {
  constructor(
    private readonly providerEscService: ProviderEtablissementServiceCaracteristiquesService,
  ) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour libellé et/ou valeur d’une caractéristique d’offre',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProviderEtablissementServiceCaracteristiqueDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEscService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer une caractéristique d’offre' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.providerEscService.remove(id, userId);
  }
}
