import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { AdminDashboardService } from './admin-dashboard.service';
import type { AdminDashboardStatsResponse } from './dto/admin-dashboard-stats.response';

/**
 * Statistiques agrégées pour le tableau de bord administrateur.
 *
 * Préfixe : `/admin/dashboard`
 */
@ApiTags('Dashboard (admin)')
@ApiBearerAuth()
@AdminOnly()
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary:
      'Statistiques dashboard admin (totaux, graphiques, récents, statuts)',
    description:
      'Réponse : `summary` (totalUsers, totalProviders, totalAdmins, totalTravelers, totalDomains, totalServices, totalCharacteristics, totalEstablishments, totalEstablishmentServices, …), `charts` (usersByRole, establishmentsByDomain, …), `recent` (recentUsers, recentEstablishments, recentEstablishmentServices), `status` (optionnel).',
  })
  @ApiResponse({
    status: 200,
    description: 'Agrégats MongoDB pour le tableau de bord administrateur.',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Rôle admin requis' })
  getStats(): Promise<AdminDashboardStatsResponse> {
    return this.adminDashboardService.getStats();
  }
}
