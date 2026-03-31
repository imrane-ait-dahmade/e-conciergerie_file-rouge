import {
  MOCK_ACTIVITIES,
  MOCK_HOTELS,
  MOCK_RESTAURANTS,
} from '@/src/data/home.mock';
import type { ServiceItem } from '@/src/types/home.types';
import type { ServiceDetail } from '@/src/types/service-detail.types';

const SHARED_LONG =
  'Un partenaire sélectionné pour la qualité de son accueil et la clarté de ses offres. Les avis reflètent une expérience globalement très positive ; la conciergerie peut vous aider pour la réservation, les transferts et les demandes spéciales.';

const DEFAULT_FEATURES = [
  { id: 'f1', label: 'Wi‑Fi', icon: 'wifi-outline' },
  { id: 'f2', label: 'Parking ou navette', icon: 'car-outline' },
  { id: 'f3', label: 'Climatisation', icon: 'snow-outline' },
  { id: 'f4', label: 'Service sur place', icon: 'restaurant-outline' },
  { id: 'f5', label: 'Sécurité & accueil', icon: 'shield-checkmark-outline' },
] as const;

const DEFAULT_GALLERY = [
  {
    id: 'g1',
    uri: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
  },
  {
    id: 'g2',
    uri: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  },
  {
    id: 'g3',
    uri: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
  },
  {
    id: 'g4',
    uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
  },
];

const FALLBACK: ServiceDetail = {
  id: 'svc-1',
  title: 'Suite vue mer — Hôtel Azur',
  shortDescription:
    'Chambre spacieuse avec balcon, vue panoramique sur la baie et petit-déjeuner inclus.',
  longDescription:
    'Profitez d’un séjour au calme dans notre suite signature : literie haut de gamme, salle de bain en marbre, coin salon et accès privilégié au spa. Idéal pour un week-end en couple ou un voyage d’affaires avec tout le confort attendu.',
  location: 'Nice, Promenade des Anglais',
  priceLabel: 'À partir de 189 € / nuit',
  rating: 4.8,
  reviewCount: 124,
  experienceCount: 42,
  category: 'Hébergement',
  image:
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
  isFavorite: false,
  provider: {
    id: 'prov-1',
    name: 'Hôtel Azur & Spa',
    avatarUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80',
    verified: true,
    premium: true,
  },
  features: [
    { id: 'x1', label: 'Wi‑Fi haut débit', icon: 'wifi-outline' },
    { id: 'x2', label: 'Parking sécurisé', icon: 'car-outline' },
    { id: 'x3', label: 'Climatisation', icon: 'snow-outline' },
    { id: 'x4', label: 'Service de chambre', icon: 'restaurant-outline' },
    { id: 'x5', label: 'Vidéosurveillance extérieure', icon: 'videocam-outline' },
    { id: 'x6', label: 'Sèche-linge (étage)', icon: 'shirt-outline' },
    { id: 'x7', label: 'Petit-déjeuner buffet', icon: 'cafe-outline' },
    { id: 'x8', label: 'Piscine & solarium', icon: 'water-outline' },
    { id: 'x9', label: 'Navette aéroport', icon: 'airplane-outline' },
  ],
  gallery: DEFAULT_GALLERY.map((g) => ({ ...g })),
};

function categoryForServiceId(id: string): string {
  if (id.startsWith('h')) return 'Hébergement';
  if (id.startsWith('r')) return 'Restaurant';
  if (id.startsWith('a')) return 'Activité';
  return 'Service';
}

function mergeFromHomeItem(item: ServiceItem): ServiceDetail {
  const short = `${item.title} — ${item.location}. Réservez ou demandez une disponibilité via la conciergerie.`;
  return {
    id: item.id,
    title: item.title,
    shortDescription: short,
    longDescription: SHARED_LONG,
    location: item.location,
    priceLabel: item.priceLabel,
    rating: item.rating,
    reviewCount: Math.round(80 + item.rating * 7),
    experienceCount: Math.round(20 + item.rating * 5),
    category: categoryForServiceId(item.id),
    image: item.image,
    isFavorite: item.isFavorite,
    provider: {
      id: `prov-${item.id}`,
      name:
        item.id.startsWith('h') || item.id.startsWith('r')
          ? 'Partenaire établissement'
          : 'Prestataire partenaire',
      avatarUrl: item.image,
      verified: true,
      premium: item.rating >= 4.9,
    },
    features: DEFAULT_FEATURES.map((f) => ({ ...f })),
    gallery: DEFAULT_GALLERY.map((g) => ({ ...g })),
  };
}

export function getMockServiceDetail(serviceId?: string): ServiceDetail {
  const all: ServiceItem[] = [
    ...MOCK_RESTAURANTS,
    ...MOCK_HOTELS,
    ...MOCK_ACTIVITIES,
  ];
  const item = serviceId ? all.find((x) => x.id === serviceId) : undefined;
  if (item) return mergeFromHomeItem(item);
  return { ...FALLBACK };
}
