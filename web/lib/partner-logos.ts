/**
 * Logos partenaires affichés sur la page d’accueil (section prestataires).
 * Remplace les entrées par de vrais fichiers dans /public quand les assets sont prêts.
 */

export type PartnerLogo = {
  /** Clé stable pour React (listes) */
  id: string;
  /** Chemin sous /public */
  src: string;
  /** Texte alternatif ; chaîne vide = décoratif (masqué aux lecteurs d’écran) */
  alt: string;
};

export const PARTNER_LOGOS: PartnerLogo[] = [
  { id: "marjane", src: "/landing/marjane.png", alt: "Marjane" },
  { id: "placeholder-a", src: "/landing/partners/partner-placeholder.svg", alt: "" },
  { id: "placeholder-b", src: "/landing/partners/partner-placeholder.svg", alt: "" },
  { id: "placeholder-c", src: "/landing/partners/partner-placeholder.svg", alt: "" },
];
