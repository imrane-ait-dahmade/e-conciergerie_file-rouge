import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderDashboardService } from './provider-dashboard.service';

@ApiTags('Provider — tableau de bord')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('prestataire')
@Controller('provider/dashboard')
export class ProviderDashboardController {
  constructor(private readonly providerDashboardService: ProviderDashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary:
      'Vue d’ensemble : compteurs et activité récente (uniquement pour le prestataire connecté)',
  })
  overview(@CurrentUser('userId') userId: string) {
    return this.providerDashboardService.getOverview(userId);
  }
}
