"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import type { CountryTableRow } from "@/lib/api/countries";
import type { CommonDictionary } from "@/lib/get-dictionary";

type PaysColumnLabels = CommonDictionary["adminGeographie"]["paysColumns"];

const th =
  "min-h-[4.75rem] px-6 py-6 text-left text-sm font-semibold tracking-tight text-foreground first:pl-12 last:pr-12 sm:px-8 md:first:pl-14 md:last:pr-14";
const td =
  "px-6 py-7 text-sm leading-relaxed first:pl-12 last:pr-12 sm:px-8 sm:py-8 md:first:pl-14 md:last:pr-14";

const btnRow =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium";

export function PaysTableHeadRow({ columns }: { columns: PaysColumnLabels }) {
  return (
    <TableRow className="border-b border-border/70 bg-muted/50 hover:bg-muted/50">
      <TableHead className={`${th} min-w-[12rem]`}>{columns.nom}</TableHead>
      <TableHead className={th}>{columns.codeIso}</TableHead>
      <TableHead className={`${th} text-right`}>{columns.actions}</TableHead>
    </TableRow>
  );
}

export function PaysTableBodyRow({
  pays,
  columns,
  onEdit,
  onDelete,
}: {
  pays: CountryTableRow;
  columns: PaysColumnLabels;
  onEdit: (row: CountryTableRow) => void;
  onDelete: (row: CountryTableRow) => void;
}) {
  const codeLabel = pays.code.trim() !== "" ? pays.code : "—";

  return (
    <TableRow className="border-b border-border/50 transition-colors hover:bg-muted/35">
      <TableCell className={`${td} font-medium text-foreground`}>{pays.nom}</TableCell>
      <TableCell className={`${td} font-mono text-muted-foreground`}>{codeLabel}</TableCell>
      <TableCell className={`${td} text-right align-middle`}>
        <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
          <Button
            type="button"
            variant="outline"
            className={`${btnRow} shadow-sm`}
            onClick={() => onEdit(pays)}
          >
            {columns.modify}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`${btnRow} px-5 text-destructive hover:bg-destructive/10 hover:text-destructive`}
            onClick={() => onDelete(pays)}
          >
            {columns.delete}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
