"use client";

import { AdminGeographieDataTable } from "@/components/admin/geographie/admin-geographie-data-table";

import { PAYS_FAKE_ROWS } from "./pays.fake-data";
import { getPaysColumns, type PaysColumnLabels } from "./pays-columns";

type PaysTableProps = {
  columnLabels: PaysColumnLabels;
};

export function PaysTable({ columnLabels }: PaysTableProps) {
  return (
    <AdminGeographieDataTable
      columns={getPaysColumns(columnLabels)}
      data={PAYS_FAKE_ROWS}
      getRowKey={(row) => row.id}
    />
  );
}
