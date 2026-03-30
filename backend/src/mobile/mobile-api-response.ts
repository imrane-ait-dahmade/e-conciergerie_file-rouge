import type { MobileDomainItemDto } from '../domaines/dto/mobile-domain-item.dto';
import type { MobileDomainDetailsData } from './resources/mobile-domain-details.resource';
import type { SliderApiResource } from '../sliders/slider.resource';
import type { MobileBestProviderResource } from './resources/mobile-best-provider.resource';
import type {
  MobileNearbyEstablishmentServiceResource,
  MobileNearbyGroupedCategoryResource,
} from './resources/mobile-nearby-establishment-service.resource';

export function mobileBestProvidersSuccess(data: MobileBestProviderResource[]) {
  return {
    success: true as const,
    message: 'Best providers fetched successfully',
    data,
  };
}

export function mobileNearbyEstablishmentServicesSuccess(
  data: MobileNearbyEstablishmentServiceResource[],
) {
  return {
    success: true as const,
    message: 'Nearby establishment services fetched successfully',
    data,
  };
}

export function mobileNearbyGroupedEstablishmentServicesSuccess(
  data: MobileNearbyGroupedCategoryResource[],
) {
  return {
    success: true as const,
    message: 'Nearby grouped establishment services fetched successfully',
    data,
  };
}

export function mobileDomainsSuccess(data: MobileDomainItemDto[]) {
  return {
    success: true as const,
    message: 'Domains fetched successfully',
    data,
  };
}

export function mobileDomainDetailsSuccess(data: MobileDomainDetailsData) {
  return {
    success: true as const,
    message: 'Domain details fetched successfully',
    data,
  };
}

export function mobileHeroSlidersSuccess(data: SliderApiResource[]) {
  return {
    success: true as const,
    message: 'Hero sliders fetched successfully',
    data,
  };
}
