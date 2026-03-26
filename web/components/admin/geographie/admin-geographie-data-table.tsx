"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

import type { AdminGeographieColumn } from "./admin-geographie-column-config";

type AdminGeographieDataTableProps<T> = {
  columns: AdminGeographieColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
};

/**
 * Tableau admin générique : en-têtes + lignes à partir de `columns` et `data`.
 */
export function AdminGeographieDataTable<T>({
  columns,
  data,
  getRowKey,
}: AdminGeographieDataTableProps<T>) {
  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardContent className="px-0 pt-4 pb-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.id} className="text-muted-foreground">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((col) => (
                  <TableCell key={col.id} className="max-w-[220px] truncate">
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
