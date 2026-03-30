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
