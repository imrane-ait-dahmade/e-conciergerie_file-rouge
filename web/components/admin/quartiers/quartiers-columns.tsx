import type { AdminGeographieColumn } from "@/components/admin/geographie/admin-geographie-column-config";
import type { QuartierRow } from "./quartiers.types";

export type QuartierColumnLabels = {
  nom: string;
  ville: string;
  codePostal: string;
};

const VILLE_NOM_BY_ID: Record<string, string> = {
  "ville-casablanca": "Casablanca",
  "ville-rabat": "Rabat",
  "ville-fes": "Fès",
  "ville-marrakech": "Marrakech",
  "ville-tanger": "Tanger",
  "ville-agadir": "Agadir",
};

export function getQuartiersColumns(
  labels: QuartierColumnLabels,
): AdminGeographieColumn<QuartierRow>[] {
  return [
    {
      id: "nom",
      header: labels.nom,
      cell: (row) => <span className="font-medium text-foreground">{row.nom}</span>,
    },
    {
      id: "ville",
      header: labels.ville,
      cell: (row) => VILLE_NOM_BY_ID[row.villeId] ?? row.villeId,
    },
    {
      id: "codePostal",
      header: labels.codePostal,
      cell: (row) => <span className="font-mono text-xs">{row.codePostal}</span>,
    },
  ];
}
