import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Domaine } from '../schemas/domaine.schema';

/**
 * Domaines de démo (Kénitra / Maroc) — barre Home, DomainDetail, recherche, carte, admin.
 * Idempotent : upsert par `slug` stable.
 */
export const DEFAULT_DOMAINES = [
  {
    nom: 'Hébergements',
    slug: 'hebergements',
    icon: 'bed',
    order: 1,
    description: 'Hôtels, riads, appartements et séjours à Kénitra.',
  },
  {
    nom: 'Restaurants',
    slug: 'restaurants',
    icon: 'utensils',
    order: 2,
    description: 'Tables, cafés, brunch et réservations.',
  },
  {
    nom: 'Transport',
    slug: 'transport',
    icon: 'car',
    order: 3,
    description: 'Chauffeur, transferts et location de véhicules.',
  },
  {
    nom: 'Activités',
    slug: 'activites',
    icon: 'map',
    order: 4,
    description: 'Excursions, visites et événements.',
  },
] as const;

export type DefaultDomaineSeed = (typeof DEFAULT_DOMAINES)[number];

/**
 * Crée ou met à jour les domaines par défaut (même slug → même document).
 */
export async function seedDomaines(
  domaineModel: Model<Domaine>,
  logger?: Logger,
): Promise<void> {
  for (const row of DEFAULT_DOMAINES) {
    await domaineModel.findOneAndUpdate(
      { slug: row.slug },
      {
        $set: {
          nom: row.nom,
          slug: row.slug,
          icon: row.icon,
          order: row.order,
          isActive: true,
          description: row.description,
        },
      },
      { upsert: true, new: true },
    );
  }
  logger?.log(
    `Seed domaines : ${DEFAULT_DOMAINES.length} entrées synchronisées (clé slug).`,
  );
}
