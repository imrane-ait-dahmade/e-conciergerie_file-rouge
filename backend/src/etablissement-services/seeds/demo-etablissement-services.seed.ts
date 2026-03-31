import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Domaine } from '../../domaines/schemas/domaine.schema';
import { EtablissementServiceCaracteristique } from '../../etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';
import { Etablissement } from '../../etablissements/schemas/etablissement.schema';
import { Service } from '../../services/schemas/service.schema';
import { EtablissementService } from '../schemas/etablissement-service.schema';

/**
 * Offres démo : une ligne par couple (établissement, service catalogue) — index unique MongoDB.
 * Le libellé marketing (« Chambre Standard Confort », etc.) est porté par `commentaire`.
 *
 * Géolocalisation : `latitude` / `longitude` sur chaque liaison → `location` (GeoJSON Point, 2dsphere)
 * pour les agrégations `$geoNear` (mobile nearby, `/map/nearby`). Décalages légers vs le siège
 * pour plusieurs pins dans le même quartier sans confondre les points.
 *
 * Schéma réel : pas de slug/titre/cover dédiés sur `etablissement_services` ; prix, coords, adresse optionnelle.
 */
type DemoOfferSeed = {
  etablissementSlug: string;
  /** Nom exact du `Service` catalogue (seed services.seed.ts). */
  catalogServiceNom: string;
  domainSlug: string;
  /** Titre affichable + description longue dans le commentaire. */
  commentaire: string;
  prix: number;
  adresse?: string;
  location_label?: string;
  location_type?: string;
  /** Décalage léger par rapport au siège (carte / proximité). */
  latDelta: number;
  lngDelta: number;
  caracteristiques: ReadonlyArray<{ libelle: string; valeur: string }>;
};

const DEMO_OFFERS: readonly DemoOfferSeed[] = [
  // Hôtel Maamora Palace — Maamora
  {
    etablissementSlug: 'hotel-maamora-palace',
    catalogServiceNom: 'Hôtel',
    domainSlug: 'hebergements',
    commentaire:
      'Chambre Standard Confort — Chambre double ou lits jumeaux, literie premium, bureau, coffre-fort. Vue jardin ou piscine. Petit-déjeuner buffet inclus. Idéal affaires et courts séjours.',
    prix: 950,
    location_label: 'Aile jardin — Maamora',
    location_type: 'room',
    latDelta: 0.00065,
    lngDelta: -0.00042,
    caracteristiques: [
      { libelle: 'Capacité', valeur: '2 personnes' },
      { libelle: 'Surface indicative', valeur: '28 m²' },
    ],
  },
  {
    etablissementSlug: 'hotel-maamora-palace',
    catalogServiceNom: 'Riad',
    domainSlug: 'hebergements',
    commentaire:
      'Suite Premium Vue Ville — Suite type riad avec salon, salle de bain marbre et grande terrasse privée avec vue panoramique sur Kénitra. Service de conciergerie dédié.',
    prix: 1890,
    location_label: 'Terrasse panoramique',
    location_type: 'suite',
    latDelta: -0.00055,
    lngDelta: 0.00048,
    caracteristiques: [
      { libelle: 'Vue', valeur: 'Ville et coucher de soleil' },
      { libelle: 'Surface indicative', valeur: '55 m²' },
    ],
  },
  {
    etablissementSlug: 'hotel-maamora-palace',
    catalogServiceNom: 'Appartement meublé',
    domainSlug: 'hebergements',
    commentaire:
      'Appartement Meublé Business — T2 entièrement équipé (cuisine, lave-linge, Wi‑Fi fibre), séjour prolongé et télétravail. Parking couvert partenaire à proximité.',
    prix: 720,
    location_label: 'Résidence affaires',
    location_type: 'apartment',
    latDelta: 0.00072,
    lngDelta: 0.00028,
    caracteristiques: [
      { libelle: 'Durée', valeur: 'À partir de 3 nuits' },
      { libelle: 'Équipement', valeur: 'Bureau ergonomique' },
    ],
  },
  // Restaurant Sebou Lounge — Centre Ville
  {
    etablissementSlug: 'restaurant-sebou-lounge',
    catalogServiceNom: 'Restaurant gastronomique',
    domainSlug: 'restaurants',
    commentaire:
      'Dîner Gastronomique Signature — Menu dégustation 5 services, produits locaux et carte des vins sélectionnée par notre sommelier. Réservation conseillée.',
    prix: 480,
    location_label: 'Salle principale & chef’s table',
    location_type: 'dining',
    latDelta: 0.00052,
    lngDelta: -0.00038,
    caracteristiques: [
      { libelle: 'Formule', valeur: 'Menu dégustation' },
      { libelle: 'Service', valeur: 'Soirée 19h30–23h' },
    ],
  },
  {
    etablissementSlug: 'restaurant-sebou-lounge',
    catalogServiceNom: 'Brunch premium',
    domainSlug: 'restaurants',
    commentaire:
      'Brunch Premium Week-end — Buffet sucré/salé, œufs à la carte, viennoiseries maison, jus pressés et bulles en option. Samedi & dimanche 11h–15h.',
    prix: 295,
    location_label: 'Terrasse couverte',
    location_type: 'brunch',
    latDelta: -0.00044,
    lngDelta: 0.00058,
    caracteristiques: [
      { libelle: 'Créneau', valeur: 'Week-end' },
      { libelle: 'Option', valeur: 'Champagne' },
    ],
  },
  {
    etablissementSlug: 'restaurant-sebou-lounge',
    catalogServiceNom: 'Café',
    domainSlug: 'restaurants',
    commentaire:
      'Café & Dessert Lounge — Pause gourmande : pâtisseries fines, chocolat chaud, thés à la menthe et corbeille de cornes de gazelle. Service continu 10h–22h.',
    prix: 125,
    location_label: 'Salon lounge',
    location_type: 'cafe',
    latDelta: 0.00038,
    lngDelta: 0.00036,
    caracteristiques: [
      { libelle: 'Ambiance', valeur: 'Lounge calme' },
      { libelle: 'Spécialité', valeur: 'Pâtisserie maison' },
    ],
  },
  // Kenitra Drive Premium — Val Fleuri / transport
  {
    etablissementSlug: 'kenitra-drive-premium',
    catalogServiceNom: 'Chauffeur privé',
    domainSlug: 'transport',
    commentaire:
      'Chauffeur Privé Demi-journée — Berline premium avec chauffeur bilingue, 4 h consécutives dans Kénitra et environs. Attente et itinéraire adaptés (RDV, hôtels, gare).',
    prix: 850,
    location_label: 'Prise en charge à l’adresse',
    location_type: 'chauffeur',
    latDelta: 0.00058,
    lngDelta: -0.00052,
    caracteristiques: [
      { libelle: 'Durée', valeur: '4 h' },
      { libelle: 'Véhicule', valeur: 'Berline premium' },
    ],
  },
  {
    etablissementSlug: 'kenitra-drive-premium',
    catalogServiceNom: 'Transfert gare / aéroport',
    domainSlug: 'transport',
    commentaire:
      'Transfert Gare Kénitra — Prise en charge porte-à-porte vers/depuis la gare ONCF de Kénitra, suivi de vol et assistance bagages. Ponctualité garantie.',
    prix: 160,
    location_label: 'Gare ONCF Kénitra',
    location_type: 'transfer',
    latDelta: -0.00042,
    lngDelta: 0.00062,
    caracteristiques: [
      { libelle: 'Bagages', valeur: 'Jusqu’à 3 valises' },
      { libelle: 'Attente', valeur: '15 min incluses' },
    ],
  },
  {
    etablissementSlug: 'kenitra-drive-premium',
    catalogServiceNom: 'Location voiture',
    domainSlug: 'transport',
    commentaire:
      'Location Voiture Premium — Berline ou SUV récents, kilométrage journalier généreux, assurance tous risques et livraison à domicile sur Kénitra.',
    prix: 620,
    location_label: 'Parc véhicules Val Fleuri',
    location_type: 'rental',
    latDelta: 0.00068,
    lngDelta: 0.00022,
    caracteristiques: [
      { libelle: 'Formule', valeur: 'À la journée' },
      { libelle: 'Kilométrage', valeur: '200 km / jour' },
    ],
  },
];

async function resolveCatalogServiceId(
  serviceModel: Model<Service>,
  domaineModel: Model<Domaine>,
  catalogServiceNom: string,
  domainSlug: string,
): Promise<Types.ObjectId | null> {
  const domaine = await domaineModel.findOne({ slug: domainSlug }).lean();
  if (!domaine?._id) return null;
  const domaineId =
    domaine._id instanceof Types.ObjectId
      ? domaine._id
      : new Types.ObjectId(String(domaine._id));
  const svc = await serviceModel
    .findOne({ nom: catalogServiceNom, domaine: domaineId })
    .lean();
  if (!svc?._id) return null;
  return svc._id instanceof Types.ObjectId
    ? svc._id
    : new Types.ObjectId(String(svc._id));
}

/**
 * Upsert des offres démo + caractéristiques clé/valeur par offre.
 * Idempotent : clé `(etablissement, service)` ; caractéristiques `(etablissementService, libelle)`.
 */
export async function seedDemoEtablissementServices(
  liaisonModel: Model<EtablissementService>,
  escModel: Model<EtablissementServiceCaracteristique>,
  etablissementModel: Model<Etablissement>,
  serviceModel: Model<Service>,
  domaineModel: Model<Domaine>,
  logger?: Logger,
): Promise<void> {
  let liaisonSynced = 0;
  let escSynced = 0;

  for (const row of DEMO_OFFERS) {
    const etab = await etablissementModel.findOne({ slug: row.etablissementSlug }).lean();
    if (!etab?._id) {
      logger?.warn(
        `Seed offres démo : établissement "${row.etablissementSlug}" introuvable — ignoré (${row.catalogServiceNom}).`,
      );
      continue;
    }

    const serviceId = await resolveCatalogServiceId(
      serviceModel,
      domaineModel,
      row.catalogServiceNom,
      row.domainSlug,
    );
    if (!serviceId) {
      logger?.warn(
        `Seed offres démo : service catalogue "${row.catalogServiceNom}" / "${row.domainSlug}" introuvable.`,
      );
      continue;
    }

    const etabId =
      etab._id instanceof Types.ObjectId
        ? etab._id
        : new Types.ObjectId(String(etab._id));

    const latBase = etab.latitude;
    const lngBase = etab.longitude;
    const latitude =
      typeof latBase === 'number' ? latBase + row.latDelta : undefined;
    const longitude =
      typeof lngBase === 'number' ? lngBase + row.lngDelta : undefined;

    const setLiaison: Record<string, unknown> = {
      etablissement: etabId,
      service: serviceId,
      prix: row.prix,
      commentaire: row.commentaire,
      isActive: true,
      ...(row.adresse !== undefined && { adresse: row.adresse }),
      ...(row.location_label !== undefined && {
        location_label: row.location_label,
      }),
      ...(row.location_type !== undefined && {
        location_type: row.location_type,
      }),
      ...(latitude !== undefined &&
        longitude !== undefined && {
          latitude,
          longitude,
        }),
    };

    const liaison = await liaisonModel.findOneAndUpdate(
      { etablissement: etabId, service: serviceId },
      { $set: setLiaison },
      { upsert: true, new: true },
    );

    liaisonSynced += 1;

    const liaisonOid = liaison._id as Types.ObjectId;

    for (const c of row.caracteristiques) {
      await escModel.findOneAndUpdate(
        { etablissementService: liaisonOid, libelle: c.libelle },
        {
          $set: {
            etablissementService: liaisonOid,
            libelle: c.libelle,
            valeur: c.valeur,
          },
        },
        { upsert: true, new: true },
      );
      escSynced += 1;
    }
  }

  logger?.log(
    `Seed offres démo : ${liaisonSynced} liaisons établissement–service, ${escSynced} lignes caractéristiques (upsert).`,
  );
}
