"use client";

import { Modal, Spin, Switch, message } from "antd";
import { Filter, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  deleteAdminEtablissement,
  etablissementId,
  fetchAdminEtablissements,
  patchAdminEtablissementStatus,
  prestataireLabel,
  quartierLabel,
  type AdminEtablissement,
  villeLabel,
} from "@/lib/api/etablissements-admin";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

import { EtablissementFormModal } from "./etablissement-form-modal";

type Labels = CommonDictionary["adminEtablissements"];

type AdminEtablissementsTableProps = {
  labels: Labels;
  filterButtonLabel: string;
  locale: string;
  className?: string;
};

const th =
  "min-h-[4rem] px-3 py-4 text-left text-sm font-semibold text-foreground first:pl-6 last:pr-6";
const td = "px-3 py-5 text-sm leading-relaxed first:pl-6 last:pr-6 align-middle";

const toolbarBtn =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2.5 rounded-lg px-6 py-2.5 text-sm font-medium";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function formatDate(iso: string | undefined, locale: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "ar" ? "ar" : locale === "en" ? "en" : "fr-FR", {
      dateStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function AdminEtablissementsTable({
  labels,
  filterButtonLabel,
  locale,
  className,
}: AdminEtablissementsTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminEtablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | undefined>();
  const [editInitial, setEditInitial] = useState<AdminEtablissement | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetchAdminEtablissements({ page: 1, limit: 100 });
      setRows(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : labels.loadError;
      setListError(msg);
      message.error(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [labels.loadError]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return rows;
    return rows.filter((e) => {
      const blob = [
        e.nom,
        prestataireLabel(e),
        villeLabel(e),
        quartierLabel(e),
        e.email ?? "",
        e.description ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [query, rows]);

  const openCreate = () => {
    setModalMode("create");
    setEditId(undefined);
    setEditInitial(null);
    setModalOpen(true);
  };

  const openEdit = (e: AdminEtablissement) => {
    setModalMode("edit");
    setEditId(etablissementId(e));
    setEditInitial(e);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(undefined);
    setEditInitial(null);
  };

  const confirmDelete = (e: AdminEtablissement) => {
    const name = e.nom;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` « ${name} »` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAdminEtablissement(etablissementId(e));
          message.success(labels.deleteSuccess);
          await loadList();
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Suppression impossible.");
        }
      },
    });
  };

  const toggleStatus = async (e: AdminEtablissement, next: boolean) => {
    const id = etablissementId(e);
    setStatusBusyId(id);
    try {
      await patchAdminEtablissementStatus(id, next);
      message.success(labels.statusUpdated);
      setRows((prev) => prev.map((r) => (etablissementId(r) === id ? { ...r, isActive: next } : r)));
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setStatusBusyId(null);
    }
  };

  return (
    <div
      className={cn(
        "mx-2 my-4 rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]",
        className,
      )}
    >
      <EtablissementFormModal
        open={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        etablissementId={editId}
        initialRow={editInitial}
        onSuccess={() => void loadList()}
        labels={labels}
      />

      <div className="flex flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 border-b border-border/60 pb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="relative min-w-0 flex-1 lg:max-w-md">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-[1.125rem] -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                className="h-12 min-h-12 rounded-lg pl-12 pr-4 text-base md:h-11 md:min-h-11 md:text-sm"
                placeholder={labels.searchPlaceholder}
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
                aria-label={labels.searchPlaceholder}
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-4">
              <Button type="button" variant="outline" className={toolbarBtn}>
                <Filter className="size-4 shrink-0" aria-hidden />
                {filterButtonLabel}
              </Button>
              <Button type="button" className={toolbarBtn} onClick={openCreate}>
                <Plus className="size-4 shrink-0" aria-hidden />
                {labels.addEtablissement}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60 bg-background p-6 shadow-inner sm:p-8 lg:p-10">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
              <Spin size="large" />
              <p className="text-sm text-muted-foreground">{labels.loading}</p>
            </div>
          ) : listError ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm text-destructive">{listError}</p>
              <Button type="button" variant="outline" onClick={() => void loadList()}>
                {labels.retry}
              </Button>
            </div>
          ) : (
            <Table className="min-w-[960px] border-separate border-spacing-x-0 border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-b border-border/70 bg-muted/50 hover:bg-muted/50">
                  <TableHead className={`${th} min-w-[8rem]`}>{labels.colNom}</TableHead>
                  <TableHead className={`${th} min-w-[10rem]`}>{labels.colOwner}</TableHead>
                  <TableHead className={th}>{labels.colVille}</TableHead>
                  <TableHead className={th}>{labels.colQuartier}</TableHead>
                  <TableHead className={th}>{labels.colStatut}</TableHead>
                  <TableHead className={th}>{labels.colDateCreation}</TableHead>
                  <TableHead className={`${th} text-right`}>{labels.colActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-muted/20">
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className={`${td} text-center text-muted-foreground`}>
                      {labels.empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => {
                    const id = etablissementId(e);
                    return (
                      <TableRow
                        key={id}
                        className="border-b border-border/50 transition-colors hover:bg-muted/35"
                      >
                        <TableCell className={`${td} font-medium text-foreground`}>{e.nom}</TableCell>
                        <TableCell className={`${td} text-muted-foreground`}>{prestataireLabel(e)}</TableCell>
                        <TableCell className={td}>{villeLabel(e)}</TableCell>
                        <TableCell className={td}>{quartierLabel(e)}</TableCell>
                        <TableCell className={td}>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={e.isActive}
                              loading={statusBusyId === id}
                              onChange={(checked) => void toggleStatus(e, checked)}
                              aria-label={`${labels.colStatut} ${e.nom}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {e.isActive ? labels.statutActive : labels.statutInactive}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className={`${td} text-muted-foreground tabular-nums`}>
                          {formatDate(e.createdAt, locale)}
                        </TableCell>
                        <TableCell className={`${td} text-right`}>
                          <div className="flex flex-wrap items-center justify-end gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 rounded-lg px-4 text-sm shadow-sm"
                              onClick={() => openEdit(e)}
                            >
                              {labels.actionEdit}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-10 px-4 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => confirmDelete(e)}
                            >
                              {labels.actionDelete}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
