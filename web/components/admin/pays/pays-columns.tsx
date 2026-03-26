import { Badge } from "@/components/ui/badge";

import type { AdminGeographieColumn } from "@/components/admin/geographie/admin-geographie-column-config";
import type { PaysRow } from "./pays.types";

export type PaysColumnLabels = {
  codeIso2: string;
  codeIso3: string;
  nomFr: string;
  nomNative: string;
  actif: string;
  active: string;
  inactive: string;
};

export function getPaysColumns(labels: PaysColumnLabels): AdminGeographieColumn<PaysRow>[] {
  return [
    {
      id: "codeIso2",
      header: labels.codeIso2,
      cell: (row) => <span className="font-mono text-xs">{row.codeIso2}</span>,
    },
    {
      id: "codeIso3",
      header: labels.codeIso3,
      cell: (row) => <span className="font-mono text-xs">{row.codeIso3}</span>,
    },
    {
      id: "nomFr",
      header: labels.nomFr,
      cell: (row) => row.nomFr,
    },
    {
      id: "nomNative",
      header: labels.nomNative,
      cell: (row) => <span dir="auto">{row.nomNative}</span>,
    },
    {
      id: "actif",
      header: labels.actif,
      cell: (row) => (
        <Badge variant={row.actif ? "default" : "muted"}>
          {row.actif ? labels.active : labels.inactive}
        </Badge>
      ),
    },
  ];
}
