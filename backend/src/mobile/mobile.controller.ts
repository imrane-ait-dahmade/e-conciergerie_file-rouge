import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EtablissementsService } from '../etablissements/etablissements.service';
import { MobileBestProvidersQueryDto } from './dto/mobile-best-providers-query.dto';
import { mobileBestProvidersSuccess } from './mobile-api-response';
import {
  type EtabBestProviderLean,
  toMobileBestProviderResource,
} from './resources/mobile-best-provider.resource';

/**
 * API mobile / app (routes publiques).
 *
 * Réutilisable depuis un futur GET /mobile/home : injecter le même service
 * et composer les sections (sliders, best providers, etc.).
 *
 * Cache : le projet n’utilise pas encore @nestjs/cache-manager ni Redis sur ces routes ;
 * pour réduire la charge, on pourra envelopper `findMobileBestProviders` avec un cache
 * TTL court (ex. 60 s) ou une clé par langue / version d’app.
 */
@ApiTags('Mobile')
@Controller('mobile')
export class MobileController {
  constructor(private readonly etablissementsService: EtablissementsService) {}

  @Get('providers/best')
  @ApiOperation({
    summary: 'Meilleurs prestataires (accueil) — actifs et mis en avant',
  })
  async bestProviders(@Query() query: MobileBestProvidersQueryDto) {
    const limit = query.limit ?? 20;
    const rows = await this.etablissementsService.findMobileBestProviders(limit);
    const data = rows.map((row) =>
      toMobileBestProviderResource(row as EtabBestProviderLean),
    );
    return mobileBestProvidersSuccess(data);
  }
}
