import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Domaine } from '../../domaines/schemas/domaine.schema';
import { Service } from '../../services/schemas/service.schema';
import { Caracteristique } from '../schemas/caracteristique.schema';

/**
 * Caractéristiques catalogue — optionnellement liées à un service (nom + domaine slug).
 * Idempotent : mise à jour de l’`icon` si trouvé, sinon création.
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
    libelle: 'Caméra de surveillance',
    icon: 'shield-check',
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
    libelle: 'Piscine',
    icon: 'waves',
    serviceNom: 'Hôtel',
    domainSlug: 'hebergements',
  },
  {
    libelle: 'Café',
    icon: 'coffee',
    serviceNom: 'Restaurant gastronomique',
    domainSlug: 'restaurants',
  },
  {
    libelle: 'Salle de sport',
    icon: 'dumbbell',
    serviceNom: null,
    domainSlug: null,
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
    if (row.serviceNom && row.domainSlug) {
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
      continue;
    }

    const loose = await caracteristiqueModel
      .findOne({
        libelle: row.libelle,
        $or: [{ service: null }, { service: { $exists: false } }],
      })
      .exec();

    if (loose) {
      await caracteristiqueModel.updateOne(
        { _id: loose._id },
        { $set: { libelle: row.libelle, icon: row.icon } },
      );
    } else {
      await caracteristiqueModel.create({
        libelle: row.libelle,
        icon: row.icon,
      });
    }
    synced += 1;
  }
  logger?.log(
    `Seed caractéristiques : ${synced}/${DEFAULT_CARACTERISTIQUES.length} entrées synchronisées.`,
  );
}
