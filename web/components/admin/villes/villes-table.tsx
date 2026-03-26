"use client";

import { AdminGeographieDataTable } from "@/components/admin/geographie/admin-geographie-data-table";

import { VILLES_FAKE_ROWS } from "./villes.fake-data";
import { getVillesColumns, type VilleColumnLabels } from "./villes-columns";

type VillesTableProps = {
  columnLabels: VilleColumnLabels;
  /** Aligné sur la locale de la page (`fr`, `en`, `ar`). */
  locale: string;
};

export function VillesTable({ columnLabels, locale }: VillesTableProps) {
  return (
    <AdminGeographieDataTable
      columns={getVillesColumns({ labels: columnLabels, numberLocale: locale })}
      data={VILLES_FAKE_ROWS}
      getRowKey={(row) => row.id}
    />
  );
}
