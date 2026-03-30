/**
 * Aligné sur GET /services/nearby (NestJS — offre établissement × service).
 */
export type NearbyService = {
  id: string;
  title: string;
  image: string | null;
  locationLabel: string | null;
  distanceKm: number;
  rating: number | null;
  priceLabel: string | null;
  domain: { id: string; name: string } | null;
  establishmentName: string;
};
