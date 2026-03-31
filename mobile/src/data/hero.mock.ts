import type { HeroItem } from '@/src/types/home.types';

/**
 * @deprecated Données locales de démo — la Home utilise `GET /mobile/hero/sliders`.
 * Conservé pour tests / previews hors réseau si besoin.
 */
export const MOCK_HERO_ITEMS: HeroItem[] = [
  {
    id: 'hero-berklee',
    badge: 'Événement',
    title: 'Berklee at the Gnaoua Festival',
    subtitle: 'Jazz fusion & musiques du monde',
    location: 'Essaouira, Maroc',
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    ctaLabel: 'Voir plus',
    slug: 'berklee-gnaoua',
    type: 'event',
  },
  {
    id: 'hero-riad',
    badge: 'Hôtel',
    title: 'Riads & palais — médina',
    subtitle: 'Séjour d’exception à Marrakech',
    location: 'Médina, Marrakech',
    image:
      'https://images.unsplash.com/photo-1597212618440-5e92c19761e5?w=1200&q=80',
    ctaLabel: 'Découvrir',
    slug: 'marrakech-riads',
    type: 'stay',
  },
  {
    id: 'hero-gastronomie',
    badge: 'Recommandé',
    title: 'Gastronomie & tables étoilées',
    subtitle: 'Réservations prioritaires',
    location: 'Au choix dans votre ville',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    ctaLabel: 'Voir les tables',
    slug: 'gastronomie',
    type: 'restaurant',
  },
  {
    id: 'hero-desert',
    badge: 'Activité',
    title: 'Échappées nature & désert',
    subtitle: 'Excursions sur mesure, chauffeur privé',
    location: 'Agafay & environs',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    ctaLabel: 'Voir plus',
    slug: 'desert-excursions',
    type: 'activity',
  },
  {
    id: 'hero-offre',
    badge: 'Offre spéciale',
    title: 'Week-end premium —20 %',
    subtitle: 'Sélection d’hébergements partenaires',
    location: 'Offre limitée',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    ctaLabel: 'En profiter',
    slug: 'weekend-premium',
    type: 'promo',
  },
];
