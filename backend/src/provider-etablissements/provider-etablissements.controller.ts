import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderOnly } from '../auth/decorators/provider-only.decorator';
import { UpdateEtablissementStatusDto } from '../etablissements/dto/update-etablissement-status.dto';
import { ProviderCreateEtablissementDto } from './dto/provider-create-etablissement.dto';
import { ProviderUpdateEtablissementDto } from './dto/provider-update-etablissement.dto';
import { ProviderEtablissementsService } from './provider-etablissements.service';

/**
 * Espace prestataire : uniquement rôle `prestataire`, données filtrées par propriétaire (JWT).
 */
@ApiTags('Provider — établissements')
@ApiBearerAuth()
@ProviderOnly()
@Controller('provider/etablissements')
export class ProviderEtablissementsController {
  constructor(
    private readonly providerEtablissementsService: ProviderEtablissementsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lister mes établissements' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.providerEtablissementsService.findAllForProvider(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un de mes établissements' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEtablissementsService.findOneForProvider(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un établissement (moi = propriétaire)' })
  create(
    @Body() dto: ProviderCreateEtablissementDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEtablissementsService.createForProvider(dto, userId);
  }

  /** Déclaré avant PATCH :id pour que …/status ne soit pas pris pour un id. */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Activer ou désactiver un de mes établissements' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEtablissementStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEtablissementsService.updateStatusForProvider(
      id,
      dto,
      userId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un de mes établissements' })
  update(
    @Param('id') id: string,
    @Body() dto: ProviderUpdateEtablissementDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.providerEtablissementsService.updateForProvider(id, dto, userId);
  }
}
