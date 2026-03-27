"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { DistrictTableRow } from "@/lib/api/districts";

type QuartierColumnLabels = CommonDictionary["adminGeographie"]["quartiersColumns"];

const th =
  "min-h-[4.75rem] px-6 py-6 text-left text-sm font-semibold tracking-tight text-foreground first:pl-12 last:pr-12 sm:px-8 md:first:pl-14 md:last:pr-14";
const td =
  "px-6 py-7 text-sm leading-relaxed first:pl-12 last:pr-12 sm:px-8 sm:py-8 md:first:pl-14 md:last:pr-14";

const btnRow =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium";

export function QuartiersTableHeadRow({ columns }: { columns: QuartierColumnLabels }) {
  return (
    <TableRow className="border-b border-border/70 bg-muted/50 hover:bg-muted/50">
      <TableHead className={`${th} min-w-[11rem]`}>{columns.nom}</TableHead>
      <TableHead className={th}>{columns.ville}</TableHead>
      <TableHead className={th}>{columns.pays}</TableHead>
      <TableHead className={`${th} text-right`}>{columns.actions}</TableHead>
    </TableRow>
  );
}

export function QuartiersTableBodyRow({
  quartier,
  columns,
  onEdit,
  onDelete,
}: {
  quartier: DistrictTableRow;
  columns: QuartierColumnLabels;
  onEdit: (row: DistrictTableRow) => void;
  onDelete: (row: DistrictTableRow) => void;
}) {
  return (
    <TableRow className="border-b border-border/50 transition-colors hover:bg-muted/35">
      <TableCell className={`${td} font-medium text-foreground`}>{quartier.nom}</TableCell>
      <TableCell className={`${td} text-muted-foreground`}>{quartier.ville}</TableCell>
      <TableCell className={`${td} text-muted-foreground`}>{quartier.pays}</TableCell>
      <TableCell className={`${td} text-right align-middle`}>
        <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
          <Button
            type="button"
            variant="outline"
            className={`${btnRow} shadow-sm`}
            onClick={() => onEdit(quartier)}
          >
            {columns.modify}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`${btnRow} px-5 text-destructive hover:bg-destructive/10 hover:text-destructive`}
            onClick={() => onDelete(quartier)}
          >
            {columns.delete}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
