import { useMemo } from 'react';
import { Linking } from 'react-native';

import { FallbackServicesSection } from '@/src/components/home/FallbackServicesSection';
import { LocationPermissionCard } from '@/src/components/home/LocationPermissionCard';
import { NearbySectionSkeleton } from '@/src/components/home/NearbySectionSkeleton';
import { NearbyServicesSection } from '@/src/components/home/NearbyServicesSection';
import { useFallbackServices } from '@/src/hooks/useFallbackServices';
import { useNearbyServices } from '@/src/hooks/useNearbyServices';
import { useUserLocation } from '@/src/hooks/useUserLocation';

type Props = {
  favorites: Set<string>;
  onToggleFavorite: (serviceId: string) => void;
  onNearbyServicePress: (serviceId: string) => void;
  onFallbackServicePress: (serviceId: string) => void;
  onSeeAllNearby?: () => void;
  onSeeAllFallback?: () => void;
  limit?: number;
  radiusKm?: number;
};

/**
 * Bloc Home : géoloc + nearby + fallback « Sélection du moment » si besoin.
 * Ne bloque pas le reste de l’écran : toujours une suite exploitable.
 */
export function HomeLocationSection({
  favorites,
  onToggleFavorite,
  onNearbyServicePress,
  onFallbackServicePress,
  onSeeAllNearby,
  onSeeAllFallback,
  limit = 12,
  radiusKm = 50,
}: Props) {
  const loc = useUserLocation();
  const coords = loc.status === 'granted' ? loc.coords : null;
  const nearby = useNearbyServices(coords, { limit, radiusKm });
  const fallback = useFallbackServices();

  const fallbackItems = useMemo(
    () =>
      fallback.data.map((i) => ({
        ...i,
        isFavorite: favorites.has(i.id),
      })),
    [fallback.data, favorites],
  );

  if (loc.status === 'loading') {
    return <NearbySectionSkeleton />;
  }

  if (loc.status === 'granted') {
    if (nearby.loading) {
      return <NearbySectionSkeleton />;
    }
    if (nearby.error) {
      return (
        <>
          <LocationPermissionCard
            variant="nearby_error"
            detailMessage={nearby.error}
            onPrimaryPress={() => {
              void nearby.refetch();
            }}
            primaryLabel="Réessayer"
          />
          <FallbackServicesSection
            items={fallbackItems}
            loading={fallback.loading}
            onServicePress={onFallbackServicePress}
            onToggleFavorite={onToggleFavorite}
            onSeeAll={onSeeAllFallback}
          />
        </>
      );
    }
    if (nearby.data.length === 0) {
      return (
        <>
          <LocationPermissionCard variant="empty_nearby" />
          <FallbackServicesSection
            items={fallbackItems}
            loading={fallback.loading}
            onServicePress={onFallbackServicePress}
            onToggleFavorite={onToggleFavorite}
            onSeeAll={onSeeAllFallback}
          />
        </>
      );
    }
    return (
      <NearbyServicesSection
        items={nearby.data}
        onServicePress={onNearbyServicePress}
        onSeeAll={onSeeAllNearby}
      />
    );
  }

  const isDenied = loc.status === 'denied';

  return (
    <>
      <LocationPermissionCard
        variant={isDenied ? 'permission_denied' : 'gps_unavailable'}
        detailMessage={isDenied ? undefined : loc.error ?? undefined}
        onPrimaryPress={
          isDenied
            ? () => {
                Linking.openSettings().catch(() => {});
              }
            : () => {
                void loc.refresh();
              }
        }
        primaryLabel={isDenied ? 'Ouvrir les réglages' : 'Réessayer'}
      />
      <FallbackServicesSection
        items={fallbackItems}
        loading={fallback.loading}
        onServicePress={onFallbackServicePress}
        onToggleFavorite={onToggleFavorite}
        onSeeAll={onSeeAllFallback}
      />
    </>
  );
}
