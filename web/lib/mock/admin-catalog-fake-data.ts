/**
 * Données factices réalistes pour le catalogue admin (conciergerie / hôtellerie / marketplace de services).
 * Les services référencent un domaine par `domaineId` + `domaineNom` pour affichage simple.
 */

export type CatalogueStatut = "actif" | "inactif";

export type FakeDomaine = {
  id: string;
  nom: string;
  description: string;
  statut: CatalogueStatut;
  createdAt: string;
};

export type FakeService = {
  id: string;
  nom: string;
  description: string;
  statut: CatalogueStatut;
  createdAt: string;
  /** Référence au domaine */
  domaineId: string;
  domaineNom: string;
};

export type CaracteristiqueType = "service" | "general";

export type FakeCaracteristique = {
  id: string;
  nom: string;
  description: string;
  statut: CatalogueStatut;
  createdAt: string;
  type: CaracteristiqueType;
};

export const FAKE_DOMAINES: FakeDomaine[] = [
  {
    id: "d1",
    nom: "Hôtellerie & hébergement",
    description: "Riads, hôtels, maisons d’hôtes et locations courte durée.",
    statut: "actif",
    createdAt: "2024-06-12T09:15:00.000Z",
  },
  {
    id: "d2",
    nom: "Restauration & traiteur",
    description: "Tables gastronomiques, cafés, livraison et réceptions privées.",
    statut: "actif",
    createdAt: "2024-06-12T09:20:00.000Z",
  },
  {
    id: "d3",
    nom: "Bien-être & détente",
    description: "Spas, hammams, massages et soins à domicile.",
    statut: "actif",
    createdAt: "2024-07-03T11:00:00.000Z",
  },
  {
    id: "d4",
    nom: "Transports & mobilité",
    description: "Transferts aéroport, chauffeur privé, location avec ou sans chauffeur.",
    statut: "actif",
    createdAt: "2024-08-01T08:45:00.000Z",
  },
  {
    id: "d5",
    nom: "Expériences & loisirs",
    description: "Excursions, ateliers culinaires, guides et activités locales.",
    statut: "inactif",
    createdAt: "2024-09-10T14:30:00.000Z",
  },
];

export const FAKE_SERVICES: FakeService[] = [
  {
    id: "s1",
    nom: "Chambre deluxe vue médina",
    description: "Vue panoramique, literie king-size, petit-déjeuner marocain inclus.",
    statut: "actif",
    createdAt: "2024-10-02T10:00:00.000Z",
    domaineId: "d1",
    domaineNom: "Hôtellerie & hébergement",
  },
  {
    id: "s2",
    nom: "Suite familiale (2 adultes + 2 enfants)",
    description: "Deux chambres communicantes, coin salon, accès piscine.",
    statut: "actif",
    createdAt: "2024-10-05T15:20:00.000Z",
    domaineId: "d1",
    domaineNom: "Hôtellerie & hébergement",
  },
  {
    id: "s3",
    nom: "Menu dégustation 5 services",
    description: "Carte du chef, accords thé et jus maison, réservation 24 h à l’avance.",
    statut: "actif",
    createdAt: "2024-11-01T19:00:00.000Z",
    domaineId: "d2",
    domaineNom: "Restauration & traiteur",
  },
  {
    id: "s4",
    nom: "Brunch dominical",
    description: "Buffet sucré-salé, viennoiseries, jus pressés, jusqu’à 14 h.",
    statut: "actif",
    createdAt: "2024-11-08T08:30:00.000Z",
    domaineId: "d2",
    domaineNom: "Restauration & traiteur",
  },
  {
    id: "s5",
    nom: "Massage relaxant 60 min",
    description: "Huiles chaudes, option hammam en amont sur demande.",
    statut: "actif",
    createdAt: "2024-11-18T13:45:00.000Z",
    domaineId: "d3",
    domaineNom: "Bien-être & détente",
  },
  {
    id: "s6",
    nom: "Transfert aéroport Marrakech – médina",
    description: "Véhicule climatisé, eau fraîche, prise en charge à la sortie du terminal.",
    statut: "actif",
    createdAt: "2024-12-01T07:00:00.000Z",
    domaineId: "d4",
    domaineNom: "Transports & mobilité",
  },
  {
    id: "s7",
    nom: "Journée Atlas & villages berbères",
    description: "Guide francophone, déjeuner traditionnel, retour avant le coucher du soleil.",
    statut: "inactif",
    createdAt: "2024-12-15T06:00:00.000Z",
    domaineId: "d5",
    domaineNom: "Expériences & loisirs",
  },
];

export const FAKE_CARACTERISTIQUES: FakeCaracteristique[] = [
  {
    id: "c1",
    nom: "Wi-Fi haut débit",
    description: "Gratuit dans tout l’établissement ; mot de passe à l’accueil.",
    statut: "actif",
    createdAt: "2024-09-20T09:00:00.000Z",
    type: "service",
  },
  {
    id: "c2",
    nom: "Petit-déjeuner inclus",
    description: "Buffet continental et corner marocain (mssemen, amlou, jus d’orange pressé).",
    statut: "actif",
    createdAt: "2024-09-20T09:05:00.000Z",
    type: "service",
  },
  {
    id: "c3",
    nom: "Parking sécurisé",
    description: "12 places, vidéosurveillance, réservation conseillée en haute saison.",
    statut: "actif",
    createdAt: "2024-10-01T11:30:00.000Z",
    type: "service",
  },
  {
    id: "c4",
    nom: "Piscine chauffée",
    description: "Ouverte 9 h – 19 h ; serviettes fournies ; enfants sous surveillance d’un adulte.",
    statut: "actif",
    createdAt: "2024-10-01T11:35:00.000Z",
    type: "service",
  },
  {
    id: "c5",
    nom: "Animaux de compagnie",
    description: "Chiens de petite taille acceptés sur demande ; supplément ménage possible.",
    statut: "actif",
    createdAt: "2024-10-10T16:00:00.000Z",
    type: "general",
  },
  {
    id: "c6",
    nom: "Accessible PMR",
    description: "Chambre au rez-de-chaussée, rampes d’accès et sanitaires adaptés.",
    statut: "inactif",
    createdAt: "2024-11-22T10:15:00.000Z",
    type: "general",
  },
];

/** Helpers pour brancher les tables (statut → boolean `actif`) */
export function statutToActif(statut: CatalogueStatut): boolean {
  return statut === "actif";
}
