/** Options de rayon pour la carte (km). */
export const MAP_RADIUS_OPTIONS = [5, 10, 25] as const;
export type MapRadiusKm = (typeof MAP_RADIUS_OPTIONS)[number];

/** Valeur par défaut (réinitialisation des filtres). */
export const DEFAULT_MAP_RADIUS_KM: MapRadiusKm = 10;

/** Filtre d’affichage des pins (appliqué côté app — non présent sur GET /map/nearby). */
export type MapPinTypeFilter = 'all' | 'establishment' | 'service';

export const MAP_PIN_TYPE_FILTER_OPTIONS: {
  value: MapPinTypeFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Tout' },
  { value: 'establishment', label: 'Établ.' },
  { value: 'service', label: 'Services' },
];

/** Aligné sur GET /map/nearby (Nest MapNearbyItem). */
export type MapNearbyItem = {
  id: string;
  type: 'establishment' | 'service';
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  locationLabel: string | null;
  image: string | null;
  rating: number | null;
  priceLabel: string | null;
  domain: { id: string; name: string } | null;
  /** Réservé si le backend expose une distance (optionnel). */
  distanceKm?: number;
};

/** Libellés courts pour la preview carte (chips type de point). */
export const MAP_ITEM_TYPE_LABEL: Record<MapNearbyItem['type'], string> = {
  establishment: 'Établissement',
  service: 'Service',
};

/** Région par défaut (Marrakech) si géoloc indisponible. */
export const DEFAULT_MAP_REGION = {
  latitude: 31.6295,
  longitude: -7.9811,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
} as const;
