/** Ville rattachée à un pays (identifiants fictifs cohérents avec `pays.fake-data`). */
export type VilleRow = {
  id: string;
  paysId: string;
  nom: string;
  region: string;
  population: number;
};
