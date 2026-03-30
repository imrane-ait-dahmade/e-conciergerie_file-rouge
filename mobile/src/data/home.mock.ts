import type { ServiceItem } from '@/src/types/home.types';

/**
 * Sélection du moment — fallback Home quand pas de géoloc ou liste nearby vide.
 * Remplaçable plus tard par GET /services/featured (ou équivalent).
 */
export const MOCK_FALLBACK_SELECTION: ServiceItem[] = [
  {
    id: 'fb-1',
    title: 'Riad Dar Anika',
    location: 'Kasbah, Marrakech',
    priceLabel: 'À partir de 220 € / nuit',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    isFavorite: false,
  },
  {
    id: 'fb-2',
    title: 'La Table du Palais',
    location: 'Médina',
    priceLabel: 'À partir de 85 €',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    isFavorite: false,
  },
  {
    id: 'fb-3',
    title: 'Hammam & soin royal',
    location: 'Spa partenaire',
    priceLabel: 'Formule 2 h',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    isFavorite: false,
  },
  {
    id: 'fb-4',
    title: 'Quad & coucher de soleil',
    location: 'Agafay',
    priceLabel: 'Dès 65 € / pers.',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    isFavorite: false,
  },
];

export const MOCK_RESTAURANTS: ServiceItem[] = [
  {
    id: 'r1',
    title: 'La Table du Palais',
    location: 'Médina, Marrakech',
    priceLabel: 'À partir de 85 €',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    isFavorite: false,
  },
  {
    id: 'r2',
    title: 'Atlas Garden',
    location: 'Gueliz',
    priceLabel: 'Menu dégustation',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    isFavorite: true,
  },
  {
    id: 'r3',
    title: 'Le Jardin Secret',
    location: 'Médina',
    priceLabel: 'Sur réservation',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80',
    isFavorite: false,
  },
];

export const MOCK_HOTELS: ServiceItem[] = [
  {
    id: 'h1',
    title: 'Riad Dar Anika',
    location: 'Kasbah',
    priceLabel: 'À partir de 220 € / nuit',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    isFavorite: false,
  },
  {
    id: 'h2',
    title: 'Palais Namaskar',
    location: 'Palmeraie',
    priceLabel: 'Suite vue jardin',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    isFavorite: true,
  },
  {
    id: 'h3',
    title: 'Maison Brummell',
    location: 'Gueliz',
    priceLabel: 'À partir de 140 €',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    isFavorite: false,
  },
];

export const MOCK_ACTIVITIES: ServiceItem[] = [
  {
    id: 'a1',
    title: 'Quad & coucher de soleil',
    location: 'Agafay',
    priceLabel: 'Dès 65 € / pers.',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    isFavorite: false,
  },
  {
    id: 'a2',
    title: 'Hammam & soin royal',
    location: 'Spa partenaire',
    priceLabel: 'Formule 2 h',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    isFavorite: false,
  },
  {
    id: 'a3',
    title: 'Souks & artisanat',
    location: 'Visite guidée',
    priceLabel: 'Sur demande',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1539020142373-2e4201f0f49f?w=800&q=80',
    isFavorite: true,
  },
];
