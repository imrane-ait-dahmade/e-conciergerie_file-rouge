import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Slider } from '../schemas/slider.schema';

/**
 * Données de démo pour le carrousel hero (5 slides).
 *
 * Correspondance avec le schéma Mongoose :
 * - subtitle (métier) → `description`
 * - image → `picture`
 * - ctaLabel → `buttonText`
 * - order → `sortOrder`
 * - `seedKey` : clé stable pour upsert idempotent (re-lancer le seed sans doublons)
 *
 * ## Exécution du seed
 *
 * 1. **Automatique** : au démarrage de l’API Nest (`npm run start` / `start:dev`),
 *    `SliderService.onModuleInit()` appelle `seedHeroSliders()`.
 *
 * 2. **Manuel (MongoDB)** : supprimer les docs avec `seedKey` puis redémarrer l’API,
 *    ou exécuter un `findOneAndUpdate` par `seedKey` comme ci-dessous.
 *
 * 3. **Tests** : importer `seedHeroSliders` + modèle mocké dans un test d’intégration.
 */
export type HeroSliderSeedRow = {
  seedKey: string;
  title: string;
  description: string;
  picture: string;
  badge: string;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  buttonText: string;
  buttonLink: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
};

export const HERO_SLIDERS_SEED: HeroSliderSeedRow[] = [
  {
    seedKey: 'hero-seed-event',
    title: 'Festival & concerts en plein air',
    description:
      'Jazz, musiques du monde et scènes iconiques — réservations prioritaires.',
    picture:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    badge: 'Événement',
    color: null,
    isActive: true,
    sortOrder: 1,
    buttonText: 'Voir le programme',
    buttonLink: null,
    startsAt: null,
    endsAt: null,
  },
  {
    seedKey: 'hero-seed-hotel',
    title: 'Palaces & riads d’exception',
    description:
      'Séjours cinq étoiles, spa et vue médina — partenaires sélectionnés.',
    picture:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    badge: 'Hôtel luxe',
    color: null,
    isActive: true,
    sortOrder: 2,
    buttonText: 'Réserver',
    buttonLink: null,
    startsAt: null,
    endsAt: null,
  },
  {
    seedKey: 'hero-seed-restaurant',
    title: 'Tables gastronomiques & chefs',
    description:
      'Dégustations, menus dégustation et cartes des vins — au choix dans votre ville.',
    picture:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    badge: 'Restaurant',
    color: null,
    isActive: true,
    sortOrder: 3,
    buttonText: 'Découvrir les tables',
    buttonLink: null,
    startsAt: null,
    endsAt: null,
  },
  {
    seedKey: 'hero-seed-activity',
    title: 'Échappées nature & désert',
    description:
      'Excursions sur mesure, guides et chauffeur privé pour vos journées.',
    picture:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    badge: 'Activité',
    color: null,
    isActive: true,
    sortOrder: 4,
    buttonText: 'Explorer',
    buttonLink: null,
    startsAt: null,
    endsAt: null,
  },
  {
    seedKey: 'hero-seed-transport',
    title: 'Transferts aéroport & chauffeur',
    description:
      'Berline, van ou SUV — prise en charge ponctuelle ou à la journée.',
    picture:
      'https://images.unsplash.com/photo-1449965408869-eaa3f617e672?w=1200&q=80',
    badge: 'Transport',
    color: null,
    isActive: true,
    sortOrder: 5,
    buttonText: 'Réserver un trajet',
    buttonLink: null,
    startsAt: null,
    endsAt: null,
  },
];

/**
 * Upsert idempotent par `seedKey` : relancer l’app sans dupliquer les slides.
 */
export async function seedHeroSliders(
  sliderModel: Model<Slider>,
  logger?: Logger,
): Promise<void> {
  for (const row of HERO_SLIDERS_SEED) {
    await sliderModel.findOneAndUpdate(
      { seedKey: row.seedKey },
      {
        $set: {
          seedKey: row.seedKey,
          title: row.title,
          description: row.description,
          picture: row.picture,
          badge: row.badge,
          color: row.color,
          isActive: row.isActive,
          sortOrder: row.sortOrder,
          buttonText: row.buttonText,
          buttonLink: row.buttonLink,
          startsAt: row.startsAt,
          endsAt: row.endsAt,
        },
      },
      { upsert: true, new: true },
    );
  }
  logger?.log(
    `Seed sliders hero : ${HERO_SLIDERS_SEED.length} entrées synchronisées (clé seedKey).`,
  );
}
