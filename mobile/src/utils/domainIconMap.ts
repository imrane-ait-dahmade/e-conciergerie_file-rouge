/**
 * Mapping clés backend → glyphes Ionicons, consommé par `DomainGlyphIcon` / `DomainBar`.
 */
import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Nom de glyphe valide pour `<Ionicons name={…} />` (@expo/vector-icons). */
export type IoniconGlyphName = ComponentProps<typeof Ionicons>['name'];

/**
 * Icône de secours quand la clé backend est absente ou inconnue.
 * (Grille = neutre, reconnaissable comme « placeholder ».)
 */
export const DOMAIN_ICON_FALLBACK: IoniconGlyphName = 'apps-outline';

/**
 * Correspondance : chaîne API (`GET /mobile/domains` → `data[].icon`) → glyphe Ionicons.
 * Les clés sont en minuscules ; la résolution est insensible à la casse.
 *
 * Équivalences « métier » :
 * - bed → hébergement
 * - plane → vols
 * - car → transport
 * - utensils → restauration / couverts
 * - map → carte / activités géolocalisées
 * - music → musique / événements
 */
export const DOMAIN_BACKEND_ICON_TO_ION: Readonly<
  Record<string, IoniconGlyphName>
> = {
  bed: 'bed-outline',
  plane: 'airplane-outline',
  car: 'car-outline',
  utensils: 'restaurant-outline',
  map: 'map-outline',
  music: 'musical-notes-outline',
  restaurant: 'restaurant-outline',
  activity: 'compass-outline',
  spa: 'leaf-outline',
  sparkles: 'sparkles',
  ship: 'boat-outline',
  building: 'business-outline',
  hotel: 'bed-outline',
  flight: 'airplane-outline',
  transport: 'car-outline',
};

/**
 * Convertit la clé `icon` renvoyée par le backend en nom de glyphe Ionicons affichable.
 * Pas de logique métier dans les composants : tout passe par cette fonction.
 */
export function getDomainIconGlyph(
  backendIconKey: string | null | undefined,
): IoniconGlyphName {
  if (backendIconKey == null || !String(backendIconKey).trim()) {
    return DOMAIN_ICON_FALLBACK;
  }
  const k = String(backendIconKey).trim().toLowerCase();
  return DOMAIN_BACKEND_ICON_TO_ION[k] ?? DOMAIN_ICON_FALLBACK;
}
