import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { AdminEtablissementsService } from './admin-etablissements.service';
import { AdminCreateEtablissementDto } from './dto/admin-create-etablissement.dto';
import { AdminUpdateEtablissementDto } from './dto/admin-update-etablissement.dto';
import { ListAdminEtablissementsQueryDto } from './dto/list-admin-etablissements-query.dto';
import { PatchEtablissementBestProvidersDto } from './dto/patch-etablissement-best-providers.dto';
import { UpdateEtablissementStatusDto } from './dto/update-etablissement-status.dto';

/**
 * CRUD administrateur pour les établissements.
 *
 * Préfixe `/admin/etablissements` pour ne pas entrer en conflit avec :
 * - `GET /etablissements` et `GET /etablissements/:id` (publics),
 * - `POST|PUT|DELETE /etablissements` (flux prestataire connecté).
 */
@ApiTags('Etablissements (admin)')
@ApiBearerAuth()
@AdminOnly()
@Controller('admin/etablissements')
export class AdminEtablissementsController {
  constructor(private readonly adminEtablissementsService: AdminEtablissementsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un établissement (prestataire propriétaire obligatoire)' })
  create(@Body() dto: AdminCreateEtablissementDto) {
    return this.adminEtablissementsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Lister les établissements (paginé, filtres isActive / featured accueil, recherche nom)',
  })
  list(@Query() query: ListAdminEtablissementsQueryDto) {
    return this.adminEtablissementsService.findAllPaginated(query);
  }

  /**
   * Déclaré avant GET :id — liste uniquement les établissements « Best providers » (featured).
   */
  @Get('best-providers')
  @ApiOperation({
    summary:
      'Lister les établissements mis en avant pour la section accueil (tri par ordre puis date)',
  })
  listBestProviders(@Query() query: ListAdminEtablissementsQueryDto) {
    return this.adminEtablissementsService.findBestProvidersPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail avec prestataire, domaine, pays, ville, quartier' })
  findOne(@Param('id') id: string) {
    return this.adminEtablissementsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activer ou désactiver la visibilité (isActive)' })
  patchStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEtablissementStatusDto,
  ) {
    return this.adminEtablissementsService.updateStatus(id, dto);
  }

  @Patch(':id/best-providers')
  @ApiOperation({
    summary:
      'Mettre à jour uniquement le statut « Best providers » accueil et l’ordre d’affichage',
  })
  patchBestProviders(
    @Param('id') id: string,
    @Body() dto: PatchEtablissementBestProvidersDto,
  ) {
    return this.adminEtablissementsService.updateBestProviders(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mise à jour partielle' })
  update(@Param('id') id: string, @Body() dto: AdminUpdateEtablissementDto) {
    return this.adminEtablissementsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer seulement sans réservations / offres / favoris / avis liés',
  })
  remove(@Param('id') id: string) {
    return this.adminEtablissementsService.remove(id);
  }
}
