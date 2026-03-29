import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderOnly } from '../auth/decorators/provider-only.decorator';
import { UpdateProviderEtablissementServiceCaracteristiqueDto } from './dto/update-provider-etablissement-service-caracteristique.dto';
import { ProviderEtablissementServiceCaracteristiquesService } from './provider-etablissement-service-caracteristiques.service';

@ApiTags('Provider — caractéristiques d’offre')
@ApiBearerAuth()
@ProviderOnly()
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
