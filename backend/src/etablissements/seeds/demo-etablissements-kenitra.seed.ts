import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Domaine } from '../../domaines/schemas/domaine.schema';
import { Pays } from '../../pays/schemas/pays.schema';
import { Quartier } from '../../quartiers/schemas/quartier.schema';
import { User } from '../../users/schemas/user.schema';
import { Ville } from '../../villes/schemas/ville.schema';
import { Etablissement } from '../schemas/etablissement.schema';

/** Même email que `DEMO_USERS_SEED` (prestataire). */
export const DEMO_ETABLISSEMENTS_PROVIDER_EMAIL = 'provider@econciergerie.ma';

const PAYS_NOM = 'Maroc';
const VILLE_NOM = 'Kénitra';

/**
 * Centre-ville approximatif — point de test pour `/map/nearby` et
 * `/mobile/recommendation-establishment-services` (rayon 3–15 km couvre les 3 zones seedées).
 */
export const KENITRA_DEMO_MAP_CENTER = {
  latitude: 34.261,
  longitude: -6.5805,
} as const;

type DemoEtabRow = {
  slug: string;
  nom: string;
  adresse: string;
  description: string;
  telephone: string;
  email: string;
  latitude: number;
  longitude: number;
  domainSlug: string;
  quartierNom: string;
  coverImage: string;
  logo?: string;
  isFeaturedForHomeBestProviders: boolean;
  bestProviderSortOrder: number;
  averageRating: number;
  reviewCount: number;
};

/**
 * 3 établissements premium à Kénitra — zones distinctes (carte / nearby / $geoNear sur `location`).
 * Coordonnées WGS84 plausibles ; `location` GeoJSON dérivé des lat/lng (middleware schéma).
 * Idempotent : upsert par `slug` unique.
 */
export const DEMO_ETABLISSEMENTS_KENITRA: readonly DemoEtabRow[] = [
  {
    slug: 'hotel-maamora-palace',
    nom: 'Hôtel Maamora Palace',
    adresse: '45 Avenue de la Liberté, Maamora, 14000 Kénitra',
    description:
      'Hôtel premium pour séjours business et loisirs : chambres contemporaines, spa, salles de réunion et restauration raffinée.',
    telephone: '+212 537 42 10 01',
    email: 'contact@maamora-palace.ma',
    /** Sud-ouest — quartier Maamora (éloigné du centre pour épingle distincte). */
    latitude: 34.2488,
    longitude: -6.5855,
    domainSlug: 'hebergements',
    quartierNom: 'Maamora',
    coverImage:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    logo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&q=80',
    isFeaturedForHomeBestProviders: true,
    bestProviderSortOrder: 1,
    averageRating: 4.7,
    reviewCount: 28,
  },
  {
    slug: 'restaurant-sebou-lounge',
    nom: 'Restaurant Sebou Lounge',
    adresse: '12 Boulevard Mohammed V, Centre Ville, 14000 Kénitra',
    description:
      'Restaurant lounge premium : cuisine marocaine revisitée et carte internationale, ambiance feutrée et terrasse.',
    telephone: '+212 537 42 20 88',
    email: 'bonjour@sebou-lounge.ma',
    /** Cœur de ville — proche de KENITRA_DEMO_MAP_CENTER. */
    latitude: 34.2615,
    longitude: -6.5803,
    domainSlug: 'restaurants',
    quartierNom: 'Centre Ville',
    coverImage:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
    isFeaturedForHomeBestProviders: true,
    bestProviderSortOrder: 2,
    averageRating: 4.8,
    reviewCount: 36,
  },
  {
    slug: 'kenitra-drive-premium',
    nom: 'Kenitra Drive Premium',
    adresse: '8 Rue El Massira, Val Fleuri, 14000 Kénitra',
    description:
      'Service premium de chauffeur privé, transferts et location de véhicules haut de gamme avec réservation 24h/24.',
    telephone: '+212 537 42 30 15',
    email: 'info@kenitra-drive.ma',
    /** Nord-est — Val Fleuri (zone résidentielle, épingle séparée du centre). */
    latitude: 34.2712,
    longitude: -6.5748,
    domainSlug: 'transport',
    quartierNom: 'Val Fleuri',
    coverImage:
      'https://images.unsplash.com/photo-1449965408869-eaa3f617e672?w=1600&q=80',
    isFeaturedForHomeBestProviders: true,
    bestProviderSortOrder: 3,
    averageRating: 4.6,
    reviewCount: 19,
  },
];

export async function seedDemoEtablissementsKenitra(
  etablissementModel: Model<Etablissement>,
  userModel: Model<User>,
  domaineModel: Model<Domaine>,
  paysModel: Model<Pays>,
  villeModel: Model<Ville>,
  quartierModel: Model<Quartier>,
  logger?: Logger,
): Promise<void> {
  const provider = await userModel
    .findOne({ email: DEMO_ETABLISSEMENTS_PROVIDER_EMAIL.toLowerCase() })
    .lean();
  if (!provider?._id) {
    logger?.warn(
      'Seed établissements démo : prestataire introuvable (attendu : compte demo-users seed).',
    );
    return;
  }

  const prestataireId =
    provider._id instanceof Types.ObjectId
      ? provider._id
      : new Types.ObjectId(String(provider._id));

  const pays = await paysModel.findOne({ nom: PAYS_NOM }).lean();
  if (!pays?._id) {
    logger?.warn(
      `Seed établissements démo : pays « ${PAYS_NOM} » introuvable (seed géographie).`,
    );
    return;
  }
  const paysId =
    pays._id instanceof Types.ObjectId
      ? pays._id
      : new Types.ObjectId(String(pays._id));

  const ville = await villeModel
    .findOne({ nom: VILLE_NOM, pays: paysId })
    .lean();
  if (!ville?._id) {
    logger?.warn(
      `Seed établissements démo : ville « ${VILLE_NOM} » introuvable.`,
    );
    return;
  }
  const villeId =
    ville._id instanceof Types.ObjectId
      ? ville._id
      : new Types.ObjectId(String(ville._id));

  let synced = 0;
  for (const row of DEMO_ETABLISSEMENTS_KENITRA) {
    const domaine = await domaineModel.findOne({ slug: row.domainSlug }).lean();
    if (!domaine?._id) {
      logger?.warn(
        `Seed établissements démo : domaine "${row.domainSlug}" introuvable — ${row.slug} ignoré.`,
      );
      continue;
    }
    const domaineId =
      domaine._id instanceof Types.ObjectId
        ? domaine._id
        : new Types.ObjectId(String(domaine._id));

    const quartier = await quartierModel
      .findOne({ nom: row.quartierNom, ville: villeId })
      .lean();
    if (!quartier?._id) {
      logger?.warn(
        `Seed établissements démo : quartier « ${row.quartierNom} » introuvable — ${row.slug} ignoré.`,
      );
      continue;
    }
    const quartierId =
      quartier._id instanceof Types.ObjectId
        ? quartier._id
        : new Types.ObjectId(String(quartier._id));

    const setDoc: Record<string, unknown> = {
      nom: row.nom,
      slug: row.slug,
      adresse: row.adresse,
      description: row.description,
      telephone: row.telephone,
      email: row.email,
      latitude: row.latitude,
      longitude: row.longitude,
      prestataire: prestataireId,
      domaine: domaineId,
      pays: paysId,
      ville: villeId,
      quartier: quartierId,
      coverImage: row.coverImage,
      isActive: true,
      isFeaturedForHomeBestProviders: row.isFeaturedForHomeBestProviders,
      bestProviderSortOrder: row.bestProviderSortOrder,
      averageRating: row.averageRating,
      reviewCount: row.reviewCount,
    };
    if (row.logo !== undefined) {
      setDoc.logo = row.logo;
    }

    await etablissementModel.findOneAndUpdate(
      { slug: row.slug },
      { $set: setDoc },
      { upsert: true, new: true },
    );
    synced += 1;
  }

  logger?.log(
    `Seed établissements Kénitra : ${synced}/${DEMO_ETABLISSEMENTS_KENITRA.length} établissements synchronisés (clé slug).`,
  );
}
