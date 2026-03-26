import type { ReactNode } from "react";

/**
 * Définition de colonne pour les tableaux du référentiel géographique.
 * Même forme pour pays / villes / quartiers — facile à brancher sur une API plus tard.
 */
export type AdminGeographieColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
};
