/** Modèle affiché pour un pays (données fictives, aligné sur un futur DTO API). */
export type PaysRow = {
  id: string;
  codeIso2: string;
  codeIso3: string;
  nomFr: string;
  nomNative: string;
  actif: boolean;
};
