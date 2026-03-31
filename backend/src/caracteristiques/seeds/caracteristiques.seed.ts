import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Domaine } from '../../domaines/schemas/domaine.schema';
import { Service } from '../../services/schemas/service.schema';
import { Caracteristique } from '../schemas/caracteristique.schema';

/**
 * Caractéristiques catalogue — rattachées à un service (nom + domaine slug).
 * Idempotent : clé `(libelle, service)`.
 */
export const DEFAULT_CARACTERISTIQUES = [
  {
    libelle: 'Wi-Fi',
    icon: 'wifi',
    serviceNom: 'Hôtel',
    domainSlug: 'hebergements',
  },
  {
    libelle: 'Parking',
    icon: 'parking-circle',
    serviceNom: 'Hôtel',
    domainSlug: 'hebergements',
  },
  {
    libelle: 'Climatisation',
    icon: 'snowflake',
    serviceNom: 'Riad',
    domainSlug: 'hebergements',
  },
  {
    libelle: 'Caméra extérieure',
    icon: 'camera',
    serviceNom: 'Hôtel',
    domainSlug: 'hebergements',
  },
  {
    libelle: 'Petit-déjeuner',
    icon: 'coffee',
    serviceNom: 'Brunch premium',
    domainSlug: 'restaurants',
  },
  {
    libelle: 'Piscine',
    icon: 'waves',
    serviceNom: 'Hôtel',
    domainSlug: 'hebergements',
  },
  {
    libelle: 'Navette',
    icon: 'bus',
    serviceNom: 'Transfert gare / aéroport',
    domainSlug: 'transport',
  },
  {
    libelle: 'Vue sur ville',
    icon: 'landmark',
    serviceNom: 'Appartement meublé',
    domainSlug: 'hebergements',
  },
] as const;

export type DefaultCaracteristiqueSeed = (typeof DEFAULT_CARACTERISTIQUES)[number];

async function resolveServiceId(
  serviceModel: Model<Service>,
  domaineModel: Model<Domaine>,
  serviceNom: string,
  domainSlug: string,
): Promise<Types.ObjectId | null> {
  const domaine = await domaineModel.findOne({ slug: domainSlug }).lean();
  if (!domaine?._id) return null;
  const domaineId =
    domaine._id instanceof Types.ObjectId
      ? domaine._id
      : new Types.ObjectId(String(domaine._id));
  const svc = await serviceModel
    .findOne({ nom: serviceNom, domaine: domaineId })
    .lean();
  if (!svc?._id) return null;
  return svc._id instanceof Types.ObjectId
    ? svc._id
    : new Types.ObjectId(String(svc._id));
}

export async function seedCaracteristiques(
  caracteristiqueModel: Model<Caracteristique>,
  serviceModel: Model<Service>,
  domaineModel: Model<Domaine>,
  logger?: Logger,
): Promise<void> {
  let synced = 0;
  for (const row of DEFAULT_CARACTERISTIQUES) {
    const serviceId = await resolveServiceId(
      serviceModel,
      domaineModel,
      row.serviceNom,
      row.domainSlug,
    );
    if (!serviceId) {
      logger?.warn(
        `Seed caractéristiques : service "${row.serviceNom}" / "${row.domainSlug}" introuvable — ${row.libelle} ignoré.`,
      );
      continue;
    }
    await caracteristiqueModel.findOneAndUpdate(
      { libelle: row.libelle, service: serviceId },
      {
        $set: {
          libelle: row.libelle,
          icon: row.icon,
          service: serviceId,
        },
      },
      { upsert: true, new: true },
    );
    synced += 1;
  }
  logger?.log(
    `Seed caractéristiques : ${synced}/${DEFAULT_CARACTERISTIQUES.length} entrées synchronisées.`,
  );
}
