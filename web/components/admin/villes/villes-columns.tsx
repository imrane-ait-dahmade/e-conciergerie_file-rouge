import type { AdminGeographieColumn } from "@/components/admin/geographie/admin-geographie-column-config";
import type { VilleRow } from "./villes.types";

export type VilleColumnLabels = {
  nom: string;
  region: string;
  population: string;
  pays: string;
};

const PAYS_NOM_BY_ID: Record<string, string> = {
  "pays-ma": "Maroc",
  "pays-fr": "France",
};

function formatPopulation(n: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);
}

type GetVillesColumnsOptions = {
  labels: VilleColumnLabels;
  /** Pour le format des grands nombres (ex. `fr`, `en`, `ar`). */
  numberLocale: string;
};

export function getVillesColumns({
  labels,
  numberLocale,
}: GetVillesColumnsOptions): AdminGeographieColumn<VilleRow>[] {
  return [
    {
      id: "nom",
      header: labels.nom,
      cell: (row) => <span className="font-medium text-foreground">{row.nom}</span>,
    },
    {
      id: "region",
      header: labels.region,
      cell: (row) => row.region,
    },
    {
      id: "population",
      header: labels.population,
      cell: (row) => formatPopulation(row.population, numberLocale),
    },
    {
      id: "pays",
      header: labels.pays,
      cell: (row) => PAYS_NOM_BY_ID[row.paysId] ?? row.paysId,
    },
  ];
}
