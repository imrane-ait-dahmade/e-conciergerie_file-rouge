import type { MobileBestProviderResource } from './resources/mobile-best-provider.resource';

export function mobileBestProvidersSuccess(data: MobileBestProviderResource[]) {
  return {
    success: true as const,
    message: 'Best providers fetched successfully',
    data,
  };
}
