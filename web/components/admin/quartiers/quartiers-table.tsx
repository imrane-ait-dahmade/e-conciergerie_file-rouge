"use client";

import { AdminGeographieDataTable } from "@/components/admin/geographie/admin-geographie-data-table";

import { QUARTIERS_FAKE_ROWS } from "./quartiers.fake-data";
import { getQuartiersColumns, type QuartierColumnLabels } from "./quartiers-columns";

type QuartiersTableProps = {
  columnLabels: QuartierColumnLabels;
};

export function QuartiersTable({ columnLabels }: QuartiersTableProps) {
  return (
    <AdminGeographieDataTable
      columns={getQuartiersColumns(columnLabels)}
      data={QUARTIERS_FAKE_ROWS}
      getRowKey={(row) => row.id}
    />
  );
}
