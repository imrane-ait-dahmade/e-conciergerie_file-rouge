/**
 * Domaine tel que renvoyé par GET /mobile/domains (champ `data` de l’enveloppe).
 */
export type MobileDomainDto = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  order: number;
};

export type MobileDomainsApiResponse = {
  success: boolean;
  message: string;
  data: MobileDomainDto[];
};

/**
 * Entrée normalisée pour la barre de domaines (`DomainBar`).
 * `slug` sert au filtrage futur (sections, deep links, analytics).
 */
export type DomainBarItem = {
  id: string;
  label: string;
  /** Clé brute `icon` API → glyphe via `getDomainIconGlyph` */
  iconKey: string;
  slug: string;
};

// ——————————————————————————————————————————————————————————————
// Page domaine — détail & listes (GET /mobile/domains/:id/details)
// ——————————————————————————————————————————————————————————————

/** Domaine enrichi pour l’écran détail (sous-titre, visuel optionnel). */
export type DomainItem = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image?: string | null;
  description?: string | null;
};

/** Sous-service / sous-catégorie rattaché à un domaine. */
export type DomainServiceItem = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  domainId: string;
};

/** Carte établissement / offre affichée sous les onglets sous-services. */
export type DomainEstablishmentServiceItem = {
  id: string;
  title: string;
  image?: string | null;
  locationLabel: string;
  priceLabel?: string | null;
  rating: number;
  establishmentName?: string | null;
  domainId: string;
  serviceId: string;
  /** Mis en avant côté backend (best providers / vedette). */
  isFeatured?: boolean;
  isFavorite?: boolean;
};

/** Corps `data` de la réponse agrégée (Option C — un seul aller-retour). */
export type DomainDetailResponse = {
  domain: DomainItem;
  services: DomainServiceItem[];
  items: DomainEstablishmentServiceItem[];
};

export type MobileDomainDetailApiResponse = {
  success: boolean;
  message: string;
  data: DomainDetailResponse;
};
