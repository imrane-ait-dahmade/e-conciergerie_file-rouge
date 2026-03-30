import type { Types } from 'mongoose';

/** Devise affichée côté mobile pour les cartes (pas encore persistée par offre). */
export const MOBILE_LISTING_CURRENCY = 'MAD';

export type NearbyGeoSource = 'service' | 'establishment';

export type MobileNearbyEstablishmentServiceResource = {
  id: string;
  title: string;
  short_description: string;
  price: number | null;
  currency: string;
  cover_image: string | null;
  average_rating: number | null;
  review_count: number;
  distance_meters: number;
  distance_km: number;
  effective_location: {
    latitude: number;
    longitude: number;
    address: string | null;
    location_label: string | null;
    location_type: string | null;
    source: NearbyGeoSource;
  };
  establishment: {
    id: string;
    name: string;
    logo: string | null;
    address: string | null;
  };
  service: {
    id: string;
    name: string;
  };
};

export type MobileNearbyGroupedItemResource = Omit<
  MobileNearbyEstablishmentServiceResource,
  'service' | 'establishment'
> & {
  establishment: {
    id: string;
    name: string;
    logo: string | null;
  };
};

export type MobileNearbyGroupedCategoryResource = {
  category: {
    id: string;
    name: string;
    slug: string;
    /** Clé d’icône du domaine (schéma Domaine.icon), null si absent. */
    icon: string | null;
  };
  items: MobileNearbyGroupedItemResource[];
};

function slugifyCategoryName(nom: string): string {
  const s = nom
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'category';
}

function roundDistanceKm(meters: number): number {
  return Math.round((meters / 1000) * 10) / 10;
}

function coordsFromGeoPoint(
  p?: { type?: string; coordinates?: number[] } | null,
): { latitude: number; longitude: number } | undefined {
  if (
    p?.type === 'Point' &&
    Array.isArray(p.coordinates) &&
    p.coordinates.length >= 2
  ) {
    const [lng, lat] = p.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { latitude: lat, longitude: lng };
    }
  }
  return undefined;
}

type LeanEtab = {
  _id: Types.ObjectId | string;
  nom?: string;
  adresse?: string;
  logo?: string;
  coverImage?: string;
  image?: string;
  averageRating?: number;
  reviewCount?: number;
  location?: { type?: string; coordinates?: number[] };
  latitude?: number;
  longitude?: number;
};

type LeanLiaison = {
  _id: Types.ObjectId | string;
  prix?: number;
  commentaire?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  location_label?: string;
  location_type?: string;
  location?: { type?: string; coordinates?: number[] };
};

type LeanService = {
  _id: Types.ObjectId | string;
  nom?: string;
  description?: string;
};

export type LeanDomaine = {
  _id: Types.ObjectId | string;
  nom?: string;
  icon?: string;
};

export type NearbyCandidateLean = LeanLiaison & {
  distanceMeters: number;
  _geoSource: NearbyGeoSource;
  etab: LeanEtab;
  svc: LeanService;
  dom?: LeanDomaine | null;
};

function effectiveCoords(
  liaison: LeanLiaison,
  etab: LeanEtab,
  source: NearbyGeoSource,
): { latitude: number; longitude: number } | undefined {
  if (source === 'service') {
    return (
      coordsFromGeoPoint(liaison.location) ??
      (typeof liaison.latitude === 'number' &&
      typeof liaison.longitude === 'number'
        ? { latitude: liaison.latitude, longitude: liaison.longitude }
        : undefined)
    );
  }
  return (
    coordsFromGeoPoint(etab.location) ??
    (typeof etab.latitude === 'number' && typeof etab.longitude === 'number'
      ? { latitude: etab.latitude, longitude: etab.longitude }
      : undefined)
  );
}

function effectiveAddress(
  liaison: LeanLiaison,
  etab: LeanEtab,
  source: NearbyGeoSource,
): string | null {
  const a =
    source === 'service'
      ? liaison.adresse?.trim() || etab.adresse?.trim()
      : etab.adresse?.trim() || liaison.adresse?.trim();
  return a || null;
}

export function toMobileNearbyEstablishmentServiceResource(
  row: NearbyCandidateLean,
  coverUrl: string | null,
): MobileNearbyEstablishmentServiceResource | null {
  const coords = effectiveCoords(row, row.etab, row._geoSource);
  if (!coords) {
    return null;
  }

  const title = row.svc.nom?.trim() || 'Service';
  const shortDesc =
    row.svc.description?.trim() ||
    row.commentaire?.trim() ||
    '';

  const coverFallback =
    coverUrl?.trim() ||
    row.etab.coverImage?.trim() ||
    row.etab.image?.trim() ||
    row.etab.logo?.trim() ||
    null;

  return {
    id: String(row._id),
    title,
    short_description: shortDesc,
    price: row.prix ?? null,
    currency: MOBILE_LISTING_CURRENCY,
    cover_image: coverFallback,
    average_rating:
      typeof row.etab.averageRating === 'number'
        ? row.etab.averageRating
        : null,
    review_count:
      typeof row.etab.reviewCount === 'number' ? row.etab.reviewCount : 0,
    distance_meters: Math.round(row.distanceMeters),
    distance_km: roundDistanceKm(row.distanceMeters),
    effective_location: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      address: effectiveAddress(row, row.etab, row._geoSource),
      location_label: row.location_label?.trim() || null,
      location_type: row.location_type?.trim() || null,
      source: row._geoSource,
    },
    establishment: {
      id: String(row.etab._id),
      name: row.etab.nom?.trim() || '',
      logo: row.etab.logo?.trim() || null,
      address: row.etab.adresse?.trim() || null,
    },
    service: {
      id: String(row.svc._id),
      name: row.svc.nom?.trim() || '',
    },
  };
}

export function toMobileNearbyGroupedItemResource(
  row: NearbyCandidateLean,
  coverUrl: string | null,
): MobileNearbyGroupedItemResource | null {
  const full = toMobileNearbyEstablishmentServiceResource(row, coverUrl);
  if (!full) {
    return null;
  }
  const { service: _s, establishment: est, ...rest } = full;
  return {
    ...rest,
    establishment: {
      id: est.id,
      name: est.name,
      logo: est.logo,
    },
  };
}

export function domaineSlug(dom: LeanDomaine | null | undefined): string {
  if (!dom?.nom) {
    return 'category';
  }
  return slugifyCategoryName(dom.nom);
}

