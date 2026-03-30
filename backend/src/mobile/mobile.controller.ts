import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DomaineService } from '../domaines/domaine.service';
import { EtablissementsService } from '../etablissements/etablissements.service';
import { SliderService } from '../sliders/slider.service';
import { MobileBestProvidersQueryDto } from './dto/mobile-best-providers-query.dto';
import { MobileHeroSlidersQueryDto } from './dto/mobile-hero-sliders-query.dto';
import { MobileNearbyGroupedRecommendationQueryDto } from './dto/mobile-nearby-grouped-recommendation-query.dto';
import { MobileNearbyRecommendationQueryDto } from './dto/mobile-nearby-recommendation-query.dto';
import {
  mobileBestProvidersSuccess,
  mobileDomainsSuccess,
  mobileNearbyEstablishmentServicesSuccess,
  mobileNearbyGroupedEstablishmentServicesSuccess,
  mobileHeroSlidersSuccess,
} from './mobile-api-response';
import {
  type EtabBestProviderLean,
  toMobileBestProviderResource,
} from './resources/mobile-best-provider.resource';
import { MobileNearbyEstablishmentServicesService } from './services/mobile-nearby-establishment-services.service';

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
  constructor(
    private readonly etablissementsService: EtablissementsService,
    private readonly nearbyEstablishmentServicesService: MobileNearbyEstablishmentServicesService,
    private readonly domaineService: DomaineService,
    private readonly sliderService: SliderService,
  ) {}

  /**
   * Domaines pour la barre horizontale de la Home : actifs uniquement, tri par `order` puis nom.
   */
  @Get('domains')
  @ApiOperation({
    summary: 'Liste des domaines pour la Home mobile',
    description:
      'Public. Retourne uniquement les domaines actifs (`isActive !== false`), triés par `order` croissant puis nom. ' +
      'Réponse vide si aucun domaine actif.',
  })
  @ApiOkResponse({
    description: 'Envelope `{ success, message, data }` où `data` est le tableau de domaines',
  })
  async domainsForHome() {
    const data = await this.domaineService.findActiveForMobileHome();
    return mobileDomainsSuccess(data);
  }

  /**
   * Slides du hero Home (carrousel) : actifs, dans la fenêtre de publication.
   * Déclaré avant les routes à segments variables pour éviter les collisions.
   */
  @Get('hero/sliders')
  @ApiOperation({
    summary: 'Slides hero (carrousel accueil)',
    description:
      'Public. Sliders actifs, `starts_at` / `ends_at` respectés si renseignés, tri `sort_order` puis date de création.',
  })
  async heroSliders(@Query() query: MobileHeroSlidersQueryDto) {
    const limit = query.limit ?? 15;
    const data = await this.sliderService.findActiveForMobileHero(limit);
    return mobileHeroSlidersSuccess(data);
  }

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

  /**
   * Recommandations proximité : offre géolocalisée d’abord, sinon siège établissement.
   *
   * Exemple : `GET /mobile/recommendation-establishment-services?latitude=33.5731&longitude=-7.5898&maxDistance=50000&limit=20`
   */
  @Get('recommendation-establishment-services')
  @ApiOperation({
    summary: 'Offres établissement à proximité (non groupées)',
    description:
      'Paramètres : latitude, longitude (obligatoires), maxDistance (m, optionnel), limit (optionnel). ' +
      'Réponses vides si aucun point géo côté offre ni établissement.',
  })
  async nearbyEstablishmentServices(@Query() query: MobileNearbyRecommendationQueryDto) {
    const data =
      await this.nearbyEstablishmentServicesService.findNearby(query);
    return mobileNearbyEstablishmentServicesSuccess(data);
  }

  /**
   * Même logique de proximité, groupée par domaine métier (Service.domaine).
   *
   * Exemple : `GET /mobile/recommendation-establishment-services/grouped?latitude=33.5731&longitude=-7.5898&limitPerGroup=5`
   */
  @Get('recommendation-establishment-services/grouped')
  @ApiOperation({
    summary: 'Offres à proximité groupées par domaine',
    description:
      'Paramètres : latitude, longitude (obligatoires), maxDistance (m, optionnel), limitPerGroup (optionnel). ' +
      'Chaque catégorie expose id, name, slug et icon. Le slug peut être persisté sur le domaine ou dérivé du nom.',
  })
  async nearbyEstablishmentServicesGrouped(
    @Query() query: MobileNearbyGroupedRecommendationQueryDto,
  ) {
    const data =
      await this.nearbyEstablishmentServicesService.findNearbyGrouped(query);
    return mobileNearbyGroupedEstablishmentServicesSuccess(data);
  }
}
