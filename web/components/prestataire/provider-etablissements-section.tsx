"use client";

import { message, Switch } from "antd";
import { Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ProviderEtablissementFormModal } from "@/components/prestataire/provider-etablissement-form-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchProviderEtablissements,
  patchProviderEtablissementStatus,
  type ProviderEtablissement,
} from "@/lib/api/provider-etablissements";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

type Labels = CommonDictionary["providerEtablissements"];

function geoName(ref: unknown): string {
  if (!ref) return "—";
  if (typeof ref === "object" && ref !== null && "nom" in ref) {
    return String((ref as { nom: unknown }).nom);
  }
  return "—";
}

function formatCreated(iso: string | undefined, locale: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function ProviderEtablissementsSection({
  labels,
  locale,
}: {
  labels: Labels;
  locale: string;
}) {
  const [rows, setRows] = useState<ProviderEtablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<ProviderEtablissement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviderEtablissements();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.loadError);
    } finally {
      setLoading(false);
    }
  }, [labels.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onToggleStatus(row: ProviderEtablissement, checked: boolean) {
    setStatusBusyId(row._id);
    try {
      const updated = await patchProviderEtablissementStatus(row._id, checked);
      setRows((prev) =>
        prev.map((r) => (r._id === row._id ? { ...r, isActive: updated.isActive } : r)),
      );
    } catch {
      message.error(labels.statusError);
    } finally {
      setStatusBusyId(null);
    }
  }

  function openEdit(row: ProviderEtablissement) {
    setEditRow(row);
    setEditOpen(true);
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{labels.pageTitle}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {labels.pageDescription}
          </p>
        </div>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "default" }), "shrink-0")}
          onClick={() => setCreateOpen(true)}
        >
          {labels.addButton}
        </button>
      </header>

      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center p-8 text-sm text-muted-foreground">
              {labels.loading}
            </div>
          ) : error ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" onClick={() => void load()}>
                {labels.retry}
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{labels.empty}</p>
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(true)}>
                {labels.addButton}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.colNom}</TableHead>
                  <TableHead>{labels.colVille}</TableHead>
                  <TableHead>{labels.colQuartier}</TableHead>
                  <TableHead>{labels.colStatut}</TableHead>
                  <TableHead>{labels.colCreated}</TableHead>
                  <TableHead className="text-right">{labels.colActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell className="font-medium text-foreground">{row.nom}</TableCell>
                    <TableCell className="text-muted-foreground">{geoName(row.ville)}</TableCell>
                    <TableCell className="text-muted-foreground">{geoName(row.quartier)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Switch
                          size="small"
                          checked={row.isActive}
                          loading={statusBusyId === row._id}
                          onChange={(checked) => void onToggleStatus(row, checked)}
                        />
                        <Badge variant={row.isActive ? "default" : "muted"}>
                          {row.isActive ? labels.statutActive : labels.statutInactive}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCreated(row.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                        {labels.actionEdit}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProviderEtablissementFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        onSuccess={() => void load()}
        labels={labels}
      />

      <ProviderEtablissementFormModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditRow(null);
        }}
        mode="edit"
        etablissementId={editRow?._id}
        initialRow={editRow}
        onSuccess={() => void load()}
        labels={labels}
      />
    </div>
  );
}
