import type { QuartierRow } from "./quartiers.types";

/**
 * Quartiers d’exemple (Casablanca, Rabat, Marrakech).
 */
export const QUARTIERS_FAKE_ROWS: QuartierRow[] = [
  {
    id: "qt-maarif",
    villeId: "ville-casablanca",
    nom: "Maârif",
    codePostal: "20100",
  },
  {
    id: "qt-anfa",
    villeId: "ville-casablanca",
    nom: "Anfa",
    codePostal: "20052",
  },
  {
    id: "qt-ain-sebaa",
    villeId: "ville-casablanca",
    nom: "Aïn Sebaâ",
    codePostal: "20250",
  },
  {
    id: "qt-hassan",
    villeId: "ville-rabat",
    nom: "Hassan",
    codePostal: "10000",
  },
  {
    id: "qt-agdal",
    villeId: "ville-rabat",
    nom: "Agdal",
    codePostal: "10020",
  },
  {
    id: "qt-medina-mrk",
    villeId: "ville-marrakech",
    nom: "Médina",
    codePostal: "40000",
  },
  {
    id: "qt-gueliz",
    villeId: "ville-marrakech",
    nom: "Gueliz",
    codePostal: "40020",
  },
];
