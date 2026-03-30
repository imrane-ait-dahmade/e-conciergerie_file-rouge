/**
 * Types pour l’écran détail d’un service (mobile).
 */

export type ProviderInfo = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  verified?: boolean;
  premium?: boolean;
};

export type FeatureItem = {
  id: string;
  label: string;
  /** Nom d’icône Ionicons (ex. wifi-outline) */
  icon: string;
};

export type GalleryItem = {
  id: string;
  uri: string;
};

export type ServiceDetail = {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  location: string;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  experienceCount: number;
  category: string;
  image: string;
  isFavorite: boolean;
  provider: ProviderInfo;
  features: FeatureItem[];
  gallery: GalleryItem[];
};
