import { Types } from 'mongoose';

function strOrNull(v: unknown): string | null {
  if (v == null) {
    return null;
  }
  const s = String(v).trim();
  return s === '' ? null : s;
}

/**
 * Document lean minimal après populate `ville` (un seul aller-retour DB).
 */
export type EtabBestProviderLean = {
  _id: Types.ObjectId;
  nom?: string;
  slug?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  image?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  ville?: { _id: Types.ObjectId; nom?: string } | Types.ObjectId | null;
};

/**
 * Payload léger pour l’accueil mobile (snake_case).
 * Les identifiants sont des chaînes ObjectId MongoDB.
 */
export interface MobileBestProviderResource {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  cover_image: string | null;
  average_rating: number | null;
  review_count: number;
  city: { id: string; name: string } | null;
}

export function toMobileBestProviderResource(
  doc: EtabBestProviderLean,
): MobileBestProviderResource {
  const v = doc.ville;
  const city =
    v && typeof v === 'object' && v !== null && '_id' in v && v._id
      ? {
          id: String(v._id),
          name: strOrNull((v as { nom?: string }).nom) ?? '',
        }
      : null;

  return {
    id: String(doc._id),
    name: doc.nom ?? '',
    slug: strOrNull(doc.slug),
    logo: strOrNull(doc.logo) ?? strOrNull(doc.image),
    cover_image: strOrNull(doc.coverImage),
    average_rating:
      typeof doc.averageRating === 'number' && !Number.isNaN(doc.averageRating)
        ? doc.averageRating
        : null,
    review_count:
      typeof doc.reviewCount === 'number' && doc.reviewCount >= 0
        ? doc.reviewCount
        : 0,
    city,
  };
}
