/**
 * États de permission / GPS pour la Home (géolocalisation).
 */
export type LocationPermissionState =
  | 'loading'
  | 'granted'
  | 'denied'
  | 'unavailable';

export type UserLocationCoords = {
  latitude: number;
  longitude: number;
};

/** Réponse GET /services/nearby — alias explicite pour l’UI. */
export type { NearbyService as NearbyServiceItem } from '@/src/types/nearby.types';

/** Cartes « sélection du moment » (mock ou GET featured). */
export type { ServiceItem as FallbackServiceItem } from '@/src/types/home.types';
