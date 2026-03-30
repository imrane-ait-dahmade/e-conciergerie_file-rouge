import type { DomainDetailResponse } from '@/src/types/domain.types';

/**
 * Données de démo pour `DomainDetailScreen` lorsque l’API n’est pas disponible
 * ou lorsque `EXPO_PUBLIC_DOMAIN_DETAIL_MOCK=1`.
 */
export function getMockDomainDetail(
  domainId: string,
  options?: { name?: string; slug?: string },
): DomainDetailResponse {
  const name = options?.name ?? 'Domaine';
  const slug = options?.slug ?? 'domaine';

  return {
    domain: {
      id: domainId,
      name,
      slug,
      icon: 'restaurant',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      description:
        'Découvrez une sélection d’offres et d’établissements pour ce domaine. Les données sont illustratives (MVP).',
    },
    services: [
      {
        id: `${domainId}-svc-1`,
        name: 'Sur place',
        slug: 'sur-place',
        icon: 'business',
        domainId,
      },
      {
        id: `${domainId}-svc-2`,
        name: 'À emporter',
        slug: 'a-emporter',
        icon: 'bag-handle',
        domainId,
      },
      {
        id: `${domainId}-svc-3`,
        name: 'Livraison',
        slug: 'livraison',
        icon: 'bicycle',
        domainId,
      },
    ],
    items: [
      {
        id: `${domainId}-item-1`,
        title: 'Expérience signature',
        image:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
        locationLabel: 'Gueliz, Marrakech',
        priceLabel: 'À partir de 250 MAD',
        rating: 4.8,
        establishmentName: 'Maison Atlas',
        domainId,
        serviceId: `${domainId}-svc-1`,
        isFavorite: false,
      },
      {
        id: `${domainId}-item-2`,
        title: 'Menu déjeuner',
        image:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        locationLabel: 'Hivernage, Marrakech',
        priceLabel: '120 MAD / pers.',
        rating: 4.5,
        establishmentName: 'Le Jardin Secret',
        domainId,
        serviceId: `${domainId}-svc-1`,
        isFavorite: true,
      },
      {
        id: `${domainId}-item-3`,
        title: 'Box découverte',
        image:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
        locationLabel: 'Centre-ville',
        priceLabel: '180 MAD',
        rating: 4.6,
        establishmentName: 'Saveurs du Sud',
        domainId,
        serviceId: `${domainId}-svc-2`,
        isFavorite: false,
      },
      {
        id: `${domainId}-item-4`,
        title: 'Livraison express',
        image:
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
        locationLabel: 'Rayon 5 km',
        priceLabel: 'Frais 20 MAD',
        rating: 4.3,
        establishmentName: 'Express Gourmet',
        domainId,
        serviceId: `${domainId}-svc-3`,
        isFavorite: false,
      },
    ],
  };
}
