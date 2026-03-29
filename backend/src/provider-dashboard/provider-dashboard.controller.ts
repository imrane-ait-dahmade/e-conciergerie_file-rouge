import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderOnly } from '../auth/decorators/provider-only.decorator';
import { ProviderDashboardService } from './provider-dashboard.service';

@ApiTags('Provider — tableau de bord')
@ApiBearerAuth()
@ProviderOnly()
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
