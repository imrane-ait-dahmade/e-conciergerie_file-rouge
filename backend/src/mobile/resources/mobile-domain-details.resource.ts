import type { Types } from 'mongoose';

import { slugifyDomainNom } from '../../domaines/domaine-slug.util';
import { MOBILE_LISTING_CURRENCY } from './mobile-nearby-establishment-service.resource';

/** Payload `data` pour GET /mobile/domains/:id/details — aligné app mobile. */
export type MobileDomainDetailsData = {
  domain: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    image: string | null;
  };
  services: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    domainId: string;
  }[];
  items: {
    id: string;
    title: string;
    image: string | null;
    locationLabel: string;
    priceLabel: string | null;
    rating: number;
    establishmentName: string;
    domainId: string;
    serviceId: string;
    isFeatured: boolean;
  }[];
};

export type LeanDomaine = {
  _id: Types.ObjectId;
  nom?: string;
  description?: string;
  icon?: string;
  slug?: string;
  isActive?: boolean;
};

export type LeanService = {
  _id: Types.ObjectId;
  nom?: string;
  icon?: string;
  domaine: Types.ObjectId;
};

export type LeanEtab = {
  _id: Types.ObjectId;
  nom?: string;
  adresse?: string;
  logo?: string;
  image?: string;
  coverImage?: string;
  averageRating?: number;
  isFeaturedForHomeBestProviders?: boolean;
  bestProviderSortOrder?: number;
  isActive?: boolean;
};

export type LeanLiaison = {
  _id: Types.ObjectId;
  etablissement: Types.ObjectId;
  service: Types.ObjectId;
  prix?: number;
  commentaire?: string;
  isActive?: boolean;
  location_label?: string;
  createdAt?: Date;
};

export function mapDomainForMobileDetails(
  doc: LeanDomaine,
): MobileDomainDetailsData['domain'] {
  const nom = doc.nom?.trim() ?? '';
  const slugPersisted = doc.slug?.trim();
  const slug =
    slugPersisted && slugPersisted !== ''
      ? slugPersisted.toLowerCase()
      : slugifyDomainNom(nom);

  return {
    id: String(doc._id),
    name: nom,
    slug,
    icon: doc.icon?.trim() ? doc.icon.trim() : null,
    description: doc.description?.trim() ? doc.description.trim() : null,
    image: null,
  };
}

export function mapCatalogService(
  s: LeanService,
  domainId: string,
): MobileDomainDetailsData['services'][0] {
  const name = s.nom?.trim() || 'Service';
  return {
    id: String(s._id),
    name,
    slug: slugifyDomainNom(name),
    icon: s.icon?.trim() ? s.icon.trim() : null,
    domainId,
  };
}

export function buildItemRow(params: {
  liaison: LeanLiaison;
  svc: LeanService;
  etab: LeanEtab;
  domainId: string;
  coverUrl: string | null;
}): MobileDomainDetailsData['items'][0] {
  const { liaison, svc, etab, domainId, coverUrl } = params;

  const title = svc.nom?.trim() || 'Service';
  const establishmentName = etab.nom?.trim() || '';

  const image =
    coverUrl?.trim() ||
    etab.coverImage?.trim() ||
    etab.image?.trim() ||
    etab.logo?.trim() ||
    null;

  const locationLabel =
    liaison.location_label?.trim() ||
    etab.adresse?.trim() ||
    '—';

  const priceLabel =
    typeof liaison.prix === 'number' && !Number.isNaN(liaison.prix)
      ? `À partir de ${Math.round(liaison.prix)} ${MOBILE_LISTING_CURRENCY}`
      : null;

  const rating =
    typeof etab.averageRating === 'number' && etab.averageRating >= 0
      ? Math.min(5, etab.averageRating)
      : 0;

  return {
    id: String(liaison._id),
    title,
    image,
    locationLabel,
    priceLabel,
    rating,
    establishmentName,
    domainId,
    serviceId: String(svc._id),
    isFeatured: etab.isFeaturedForHomeBestProviders === true,
  };
}
