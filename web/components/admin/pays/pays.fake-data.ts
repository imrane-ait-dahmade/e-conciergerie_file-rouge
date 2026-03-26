import type { PaysRow } from "./pays.types";

/**
 * Données d’exemple — Maroc comme pays principal de la plateforme.
 * Remplacer par un fetch API : `const rows = await fetchPays()`.
 */
export const PAYS_FAKE_ROWS: PaysRow[] = [
  {
    id: "pays-ma",
    codeIso2: "MA",
    codeIso3: "MAR",
    nomFr: "Maroc",
    nomNative: "المغرب",
    actif: true,
  },
  {
    id: "pays-fr",
    codeIso2: "FR",
    codeIso3: "FRA",
    nomFr: "France",
    nomNative: "France",
    actif: false,
  },
];
