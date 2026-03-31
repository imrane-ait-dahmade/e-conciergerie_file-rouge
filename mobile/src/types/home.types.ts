/**
 * Slide du hero principal (Home). Prêt pour un futur GET /mobile/home/hero.
 */
export type HeroItem = {
  id: string;
  title: string;
  /** Accroche / description courte sous le titre */
  subtitle: string;
  image: string;
  ctaLabel?: string;
  /** Ex. « Événement », « Recommandé », « Exclusif » */
  badge?: string;
  /** Filtrage / deeplink futur */
  slug?: string;
  /** Catégorie métier optionnelle (analytics, règles d’affichage) */
  type?: string;
  /** Lieu (affiché sous le sous-titre si renseigné) */
  location?: string;
  /** URL du CTA si renvoyée par l’API (ex. slider `button_link`) */
  buttonLink?: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  location: string;
  priceLabel: string;
  rating: number;
  image: string;
  isFavorite: boolean;
};
