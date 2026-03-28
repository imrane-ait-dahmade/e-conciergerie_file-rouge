"use client";

import { Modal, message } from "antd";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fetchProviderEtablissements } from "@/lib/api/provider-etablissements";
import {
  createProviderEstablishmentService,
  deleteProviderEstablishmentService,
  fetchProviderEstablishmentServices,
  updateProviderEstablishmentService,
  type UpdateProviderEtablissementServicePayload,
} from "@/lib/api/provider-establishment-services";
import { fetchServices } from "@/lib/api/services";
import { displayRefName } from "@/lib/catalog-display";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { ProviderEtablissement } from "@/lib/api/provider-etablissements";
import type { ServiceDoc } from "@/lib/types/catalog";
import type { EtablissementServiceAssignment } from "@/lib/types/etablissement-service";
import { refId } from "@/lib/types/etablissement-service";
import { cn } from "@/lib/utils";

type Labels = CommonDictionary["providerEstablishmentServices"];

function etablissementNom(row: EtablissementServiceAssignment): string {
  const e = row.etablissement;
  if (typeof e === "string") return e;
  return e?.nom ?? "—";
}

function serviceNom(row: EtablissementServiceAssignment): string {
  const s = row.service;
  if (typeof s === "string") return s;
  return s?.nom ?? "—";
}

function serviceDomaineLabel(row: EtablissementServiceAssignment): string {
  const s = row.service;
  if (typeof s === "string" || !s || typeof s !== "object") return "—";
  return displayRefName(s.domaine);
}

function etablissementActif(row: EtablissementServiceAssignment): boolean | undefined {
  const e = row.etablissement;
  if (typeof e === "string" || !e || typeof e !== "object") return undefined;
  return e.isActive;
}

function formatDate(iso: string | undefined, locale: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatPrix(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

function assignedServiceIdsForEtablissement(
  rows: EtablissementServiceAssignment[],
  etablissementId: string,
): Set<string> {
  const set = new Set<string>();
  for (const r of rows) {
    if (refId(r.etablissement) === etablissementId) {
      set.add(refId(r.service));
    }
  }
  return set;
}

type CreateFormValues = {
  etablissement: string;
  service: string;
  prix: string;
  commentaire: string;
};

type EditFormValues = {
  prix: string;
  commentaire: string;
};

export function ProviderEstablishmentServicesSection({
  labels,
  locale,
}: {
  labels: Labels;
  locale: string;
}) {
  const [rows, setRows] = useState<EtablissementServiceAssignment[]>([]);
  const [etabs, setEtabs] = useState<ProviderEtablissement[]>([]);
  const [catalog, setCatalog] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refsError, setRefsError] = useState(false);
  const [filterEtabId, setFilterEtabId] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<EtablissementServiceAssignment | null>(null);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviderEstablishmentServices();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.loadError);
    } finally {
      setLoading(false);
    }
  }, [labels.loadError]);

  const loadRefs = useCallback(async () => {
    try {
      const [eList, services] = await Promise.all([
        fetchProviderEtablissements(),
        fetchServices(),
      ]);
      setEtabs(eList);
      setCatalog(services);
    } catch {
      setRefsError(true);
      message.error(labels.loadErrorRefs);
    }
  }, [labels.loadErrorRefs]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    void loadRefs();
  }, [loadRefs]);

  const filteredRows = useMemo(() => {
    if (!filterEtabId) return rows;
    return rows.filter((r) => refId(r.etablissement) === filterEtabId);
  }, [rows, filterEtabId]);

  const createForm = useForm<CreateFormValues>({
    defaultValues: {
      etablissement: "",
      service: "",
      prix: "",
      commentaire: "",
    },
  });

  const editForm = useForm<EditFormValues>({
    defaultValues: { prix: "", commentaire: "" },
  });

  const watchEtab = createForm.watch("etablissement");

  const assignedForSelected = useMemo(
    () => (watchEtab ? assignedServiceIdsForEtablissement(rows, watchEtab) : new Set<string>()),
    [rows, watchEtab],
  );

  const availableServices = useMemo(() => {
    return catalog.filter((s) => !assignedForSelected.has(s._id));
  }, [catalog, assignedForSelected]);

  function openCreate() {
    createForm.reset({
      etablissement: filterEtabId || "",
      service: "",
      prix: "",
      commentaire: "",
    });
    setCreateOpen(true);
  }

  function openEdit(row: EtablissementServiceAssignment) {
    setEditRow(row);
    editForm.reset({
      prix: row.prix != null ? String(row.prix) : "",
      commentaire: row.commentaire ?? "",
    });
    setEditOpen(true);
  }

  async function submitCreate(values: CreateFormValues) {
    if (!values.etablissement || !values.service) {
      message.warning(labels.selectPlaceholder);
      return;
    }
    let prix: number | undefined;
    if (values.prix.trim()) {
      const n = Number(values.prix.replace(",", "."));
      if (Number.isNaN(n) || n < 0) {
        message.error(labels.prixInvalid);
        return;
      }
      prix = n;
    }
    try {
      await createProviderEstablishmentService({
        etablissement: values.etablissement,
        service: values.service,
        ...(prix !== undefined && { prix }),
        ...(values.commentaire.trim() && { commentaire: values.commentaire.trim() }),
      });
      message.success(labels.formSave);
      setCreateOpen(false);
      await loadAssignments();
    } catch {
      message.error(labels.saveError);
    }
  }

  async function submitEdit(values: EditFormValues) {
    if (!editRow) return;
    const payload: UpdateProviderEtablissementServicePayload = {};
    if (values.prix.trim()) {
      const n = Number(values.prix.replace(",", "."));
      if (Number.isNaN(n) || n < 0) {
        message.error(labels.prixInvalid);
        return;
      }
      payload.prix = n;
    }
    payload.commentaire = values.commentaire.trim();
    try {
      await updateProviderEstablishmentService(editRow._id, payload);
      message.success(labels.formSave);
      setEditOpen(false);
      setEditRow(null);
      await loadAssignments();
    } catch {
      message.error(labels.saveError);
    }
  }

  function confirmDelete(row: EtablissementServiceAssignment) {
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: labels.deleteConfirmDescription,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      onOk: async () => {
        try {
          await deleteProviderEstablishmentService(row._id);
          message.success(labels.deleteSuccess);
          await loadAssignments();
        } catch {
          message.error(labels.deleteError);
        }
      },
    });
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{labels.pageTitle}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{labels.pageDescription}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{labels.filterLabel}</span>
            <select
              className={cn(
                "h-9 min-w-[200px] rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              value={filterEtabId}
              onChange={(e) => setFilterEtabId(e.target.value)}
            >
              <option value="">{labels.filterAll}</option>
              {etabs.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "default" }), "shrink-0")}
            onClick={openCreate}
            disabled={refsError || etabs.length === 0}
          >
            {labels.addButton}
          </button>
        </div>
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
              <Button type="button" variant="outline" onClick={() => void loadAssignments()}>
                {labels.retry}
              </Button>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <p className="max-w-md text-sm text-muted-foreground">{labels.empty}</p>
              {etabs.length > 0 ? (
                <Button type="button" variant="secondary" onClick={openCreate}>
                  {labels.addButton}
                </Button>
              ) : null}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.colEtablissement}</TableHead>
                  <TableHead>{labels.colService}</TableHead>
                  <TableHead className="hidden md:table-cell">{labels.colDomaine}</TableHead>
                  <TableHead>{labels.colStatut}</TableHead>
                  <TableHead>{labels.colPrix}</TableHead>
                  <TableHead className="hidden lg:table-cell">{labels.colCommentaire}</TableHead>
                  <TableHead>{labels.colDateCreation}</TableHead>
                  <TableHead className="text-right">{labels.colActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => {
                  const actif = etablissementActif(row);
                  return (
                    <TableRow key={row._id}>
                      <TableCell className="font-medium">{etablissementNom(row)}</TableCell>
                      <TableCell>{serviceNom(row)}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {serviceDomaineLabel(row)}
                      </TableCell>
                      <TableCell>
                        {actif === undefined ? (
                          "—"
                        ) : actif ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {labels.statutEtabActif}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{labels.statutEtabInactif}</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{formatPrix(row.prix)}</TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                        {row.commentaire ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(row.createdAt, locale)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => confirmDelete(row)}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                            {labels.actionDelete}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        title={labels.formCreateTitle}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        destroyOnClose
        width={520}
      >
        <form
          className="mt-4 space-y-4"
          onSubmit={createForm.handleSubmit(submitCreate)}
        >
          <div className="space-y-2">
            <Label>{labels.formEtablissement}</Label>
            <select
              className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              {...createForm.register("etablissement", {
                onChange: () => createForm.setValue("service", ""),
              })}
            >
              <option value="">{labels.selectPlaceholder}</option>
              {etabs.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{labels.formService}</Label>
            <select
              className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              disabled={!watchEtab}
              {...createForm.register("service")}
            >
              <option value="">{labels.selectPlaceholder}</option>
              {availableServices.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nom}
                </option>
              ))}
            </select>
            {watchEtab && availableServices.length === 0 ? (
              <p className="text-xs text-amber-700 dark:text-amber-400">{labels.noServiceAvailable}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>{labels.formPrix}</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={labels.prixPlaceholder}
              {...createForm.register("prix")}
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.formCommentaire}</Label>
            <Textarea
              rows={3}
              placeholder={labels.commentairePlaceholder}
              {...createForm.register("commentaire")}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              {labels.formCancel}
            </Button>
            <Button type="submit" disabled={!watchEtab || availableServices.length === 0}>
              {labels.formSave}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title={labels.formEditTitle}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditRow(null);
        }}
        footer={null}
        destroyOnClose
        width={480}
      >
        <p className="text-xs text-muted-foreground">{labels.editHint}</p>
        <form
          className="mt-4 space-y-4"
          onSubmit={editForm.handleSubmit(submitEdit)}
        >
          <div className="space-y-2">
            <Label>{labels.formPrix}</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={labels.prixPlaceholder}
              {...editForm.register("prix")}
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.formCommentaire}</Label>
            <Textarea rows={3} {...editForm.register("commentaire")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditOpen(false);
                setEditRow(null);
              }}
            >
              {labels.formCancel}
            </Button>
            <Button type="submit">{labels.formSave}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
