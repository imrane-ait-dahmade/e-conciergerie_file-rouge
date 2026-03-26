import type { VilleRow } from "./villes.types";

/**
 * Villes marocaines d’exemple (régions et populations approximatives).
 */
export const VILLES_FAKE_ROWS: VilleRow[] = [
  {
    id: "ville-casablanca",
    paysId: "pays-ma",
    nom: "Casablanca",
    region: "Casablanca-Settat",
    population: 3_359_818,
  },
  {
    id: "ville-rabat",
    paysId: "pays-ma",
    nom: "Rabat",
    region: "Rabat-Salé-Kénitra",
    population: 577_827,
  },
  {
    id: "ville-fes",
    paysId: "pays-ma",
    nom: "Fès",
    region: "Fès-Meknès",
    population: 1_112_072,
  },
  {
    id: "ville-marrakech",
    paysId: "pays-ma",
    nom: "Marrakech",
    region: "Marrakech-Safi",
    population: 928_850,
  },
  {
    id: "ville-tanger",
    paysId: "pays-ma",
    nom: "Tanger",
    region: "Tanger-Tétouan-Al Hoceïma",
    population: 948_332,
  },
  {
    id: "ville-agadir",
    paysId: "pays-ma",
    nom: "Agadir",
    region: "Souss-Massa",
    population: 577_102,
  },
];
