import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Domaine } from '../../domaines/schemas/domaine.schema';
import { Service } from '../schemas/service.schema';

/**
 * Services catalogue — clés `icon` alignées admin (Lucide) / mobile (mapping Ionicons côté app).
 * Idempotent : upsert par couple (nom, domaine) après résolution du domaine par `slug`.
 */
export const DEFAULT_SERVICES = [
  {
    nom: 'Hôtel',
    domainSlug: 'hebergements',
    icon: 'building',
    description: 'Établissements hôteliers classiques.',
  },
  {
    nom: 'Riad',
    domainSlug: 'hebergements',
    icon: 'home',
    description: 'Séjours en maisons d’hôtes traditionnelles.',
  },
  {
    nom: 'Transfert aéroport',
    domainSlug: 'transport',
    icon: 'plane-landing',
    description: 'Navettes et prise en charge aéroport.',
  },
  {
    nom: 'Restaurant gastronomique',
    domainSlug: 'restaurants',
    icon: 'chef-hat',
    description: 'Tables haute gastronomie et chefs.',
  },
  {
    nom: 'Excursion guidée',
    domainSlug: 'activites',
    icon: 'map',
    description: 'Sorties accompagnées et découvertes.',
  },
  {
    nom: 'Billetterie',
    domainSlug: 'evenements',
    icon: 'ticket',
    description: 'Places et accès événements.',
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
