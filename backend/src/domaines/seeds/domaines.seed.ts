import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Domaine } from '../schemas/domaine.schema';

/**
 * Domaines de référence pour la Home mobile (barre horizontale).
 * Idempotent : upsert par `slug` (stable) pour les tests UI et environnements vides.
 */
export const DEFAULT_DOMAINES = [
  {
    nom: 'Hébergements',
    slug: 'hebergements',
    icon: 'bed',
    order: 1,
    description: 'Hôtels, riads, villas et séjours.',
  },
  {
    nom: 'Vols',
    slug: 'vols',
    icon: 'plane',
    order: 2,
    description: 'Billets et options aériennes.',
  },
  {
    nom: 'Transport',
    slug: 'transport',
    icon: 'car',
    order: 3,
    description: 'Transferts, chauffeur, location.',
  },
  {
    nom: 'Restaurants',
    slug: 'restaurants',
    icon: 'utensils',
    order: 4,
    description: 'Tables, gastronomie et réservations.',
  },
  {
    nom: 'Activités',
    slug: 'activites',
    icon: 'map',
    order: 5,
    description: 'Excursions, loisirs et expériences.',
  },
] as const;

export type DefaultDomaineSeed = (typeof DEFAULT_DOMAINES)[number];

/**
 * Crée ou met à jour les domaines par défaut (même slug → même ligne, champs alignés sur le seed).
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
