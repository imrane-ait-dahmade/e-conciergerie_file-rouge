import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Domaine } from '../../domaines/schemas/domaine.schema';
import { Service } from '../schemas/service.schema';

/**
 * Services catalogue par domaine — clés `icon` (Lucide / mapping mobile).
 * Idempotent : upsert par couple (`nom`, `domaine`) après résolution du domaine par `slug`.
 */
export const DEFAULT_SERVICES = [
  // Hébergements
  {
    nom: 'Hôtel',
    domainSlug: 'hebergements',
    icon: 'building',
    description: 'Établissements hôteliers et réservations.',
  },
  {
    nom: 'Riad',
    domainSlug: 'hebergements',
    icon: 'home',
    description: 'Maisons d’hôtes et séjours typiques.',
  },
  {
    nom: 'Appartement meublé',
    domainSlug: 'hebergements',
    icon: 'layout-grid',
    description: 'Locations meublées pour séjours moyens ou longs.',
  },
  // Restaurants
  {
    nom: 'Restaurant gastronomique',
    domainSlug: 'restaurants',
    icon: 'chef-hat',
    description: 'Tables gastronomie et cartes du chef.',
  },
  {
    nom: 'Café',
    domainSlug: 'restaurants',
    icon: 'coffee',
    description: 'Cafés et pauses gourmandes.',
  },
  {
    nom: 'Brunch premium',
    domainSlug: 'restaurants',
    icon: 'sunrise',
    description: 'Brunch et formules petit-déjeuner.',
  },
  // Transport
  {
    nom: 'Chauffeur privé',
    domainSlug: 'transport',
    icon: 'car-front',
    description: 'Mise à disposition et trajets sur mesure.',
  },
  {
    nom: 'Transfert gare / aéroport',
    domainSlug: 'transport',
    icon: 'plane-landing',
    description: 'Navettes gare, aéroport et prise en charge.',
  },
  {
    nom: 'Location voiture',
    domainSlug: 'transport',
    icon: 'car',
    description: 'Véhicules de location pour la région.',
  },
  // Activités
  {
    nom: 'Excursion',
    domainSlug: 'activites',
    icon: 'compass',
    description: 'Sorties et découvertes guidées.',
  },
  {
    nom: 'Visite guidée',
    domainSlug: 'activites',
    icon: 'map-pin',
    description: 'Parcours commentés et visites culturelles.',
  },
  {
    nom: 'Événement',
    domainSlug: 'activites',
    icon: 'ticket',
    description: 'Concerts, festivals et billetterie.',
  },
] as const;

export type DefaultServiceSeed = (typeof DEFAULT_SERVICES)[number];

export async function seedServices(
  serviceModel: Model<Service>,
  domaineModel: Model<Domaine>,
  logger?: Logger,
): Promise<void> {
  let synced = 0;
  for (const row of DEFAULT_SERVICES) {
    const domaine = await domaineModel.findOne({ slug: row.domainSlug }).lean();
    if (!domaine?._id) {
      logger?.warn(
        `Seed services : domaine "${row.domainSlug}" introuvable — ignoré (${row.nom}).`,
      );
      continue;
    }
    const domaineId =
      domaine._id instanceof Types.ObjectId
        ? domaine._id
        : new Types.ObjectId(String(domaine._id));

    await serviceModel.findOneAndUpdate(
      { nom: row.nom, domaine: domaineId },
      {
        $set: {
          nom: row.nom,
          domaine: domaineId,
          icon: row.icon,
          description: row.description,
        },
      },
      { upsert: true, new: true },
    );
    synced += 1;
  }
  logger?.log(
    `Seed services : ${synced}/${DEFAULT_SERVICES.length} entrées synchronisées (clé nom + domaine).`,
  );
}
