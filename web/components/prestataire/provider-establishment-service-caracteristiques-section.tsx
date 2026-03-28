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
import { fetchCaracteristiques } from "@/lib/api/caracteristiques";
import {
  createProviderEsc,
  deleteProviderEsc,
  fetchProviderEscForEstablishmentService,
  updateProviderEsc,
  type UpdateProviderEscPayload,
} from "@/lib/api/provider-etablissement-service-caracteristiques";
import { fetchProviderEstablishmentServices } from "@/lib/api/provider-establishment-services";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { CaracteristiqueDoc } from "@/lib/types/catalog";
import type { EtablissementServiceAssignment } from "@/lib/types/etablissement-service";
import { refId } from "@/lib/types/etablissement-service";
import { cn } from "@/lib/utils";

type Labels = CommonDictionary["providerEstablishmentServiceCaracteristiques"];

type EscTableRow = {
  _id: string;
  etablissementServiceId: string;
  etablissementNom: string;
  serviceNom: string;
  libelle: string;
  valeur: string;
  createdAt?: string;
};

function etablissementNom(es: EtablissementServiceAssignment): string {
  const e = es.etablissement;
  if (typeof e === "string") return e;
  return e?.nom ?? "—";
}

function serviceNom(es: EtablissementServiceAssignment): string {
  const s = es.service;
  if (typeof s === "string") return s;
  return s?.nom ?? "—";
}

function offerLabel(es: EtablissementServiceAssignment): string {
  return `${etablissementNom(es)} — ${serviceNom(es)}`;
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

type CreateFormValues = {
  etablissementService: string;
  caracteristiqueCatalogId: string;
  libelle: string;
  valeur: string;
};

type EditFormValues = {
  libelle: string;
  valeur: string;
};

export function ProviderEstablishmentServiceCaracteristiquesSection({
  labels,
  locale,
}: {
  labels: Labels;
  locale: string;
}) {
  const [esAssignments, setEsAssignments] = useState<EtablissementServiceAssignment[]>([]);
  const [catalog, setCatalog] = useState<CaracteristiqueDoc[]>([]);
  const [rows, setRows] = useState<EscTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refsReady, setRefsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refsError, setRefsError] = useState(false);

  const [filterEtabId, setFilterEtabId] = useState("");
  const [filterEsId, setFilterEsId] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"catalog" | "free">("catalog");

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<EscTableRow | null>(null);

  const createForm = useForm<CreateFormValues>({
    defaultValues: {
      etablissementService: "",
      caracteristiqueCatalogId: "",
      libelle: "",
      valeur: "",
    },
  });

  const editForm = useForm<EditFormValues>({
    defaultValues: { libelle: "", valeur: "" },
  });

  const watchEtabService = createForm.watch("etablissementService");

  const loadRefs = useCallback(async () => {
    setRefsReady(false);
    try {
      const [esList, catalogList] = await Promise.all([
        fetchProviderEstablishmentServices(),
        fetchCaracteristiques(),
      ]);
      setEsAssignments(esList);
      setCatalog(catalogList);
    } catch {
      setRefsError(true);
      message.error(labels.loadErrorRefs);
    } finally {
      setRefsReady(true);
    }
  }, [labels.loadErrorRefs]);

  const etabsOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const es of esAssignments) {
      const id = refId(es.etablissement);
      if (id && !map.has(id)) map.set(id, etablissementNom(es));
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [esAssignments]);

  const esFilteredByEtab = useMemo(() => {
    if (!filterEtabId) return esAssignments;
    return esAssignments.filter((es) => refId(es.etablissement) === filterEtabId);
  }, [esAssignments, filterEtabId]);

  const relevantEstablishmentServices = useMemo(() => {
    if (!filterEsId) return esFilteredByEtab;
    return esFilteredByEtab.filter((es) => es._id === filterEsId);
  }, [esFilteredByEtab, filterEsId]);

  const loadRows = useCallback(async () => {
    if (!refsReady) return;
    if (relevantEstablishmentServices.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const chunks = await Promise.all(
        relevantEstablishmentServices.map(async (es) => {
          const list = await fetchProviderEscForEstablishmentService(es._id);
          return list.map((doc) => ({
            _id: doc._id,
            etablissementServiceId: es._id,
            etablissementNom: etablissementNom(es),
            serviceNom: serviceNom(es),
            libelle: doc.libelle,
            valeur: doc.valeur,
            createdAt: doc.createdAt,
          }));
        }),
      );
      const merged = chunks.flat();
      merged.sort((a, b) => {
        const ca = a.createdAt ?? "";
        const cb = b.createdAt ?? "";
        return ca.localeCompare(cb);
      });
      setRows(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.loadError);
    } finally {
      setLoading(false);
    }
  }, [refsReady, relevantEstablishmentServices, labels.loadError]);

  useEffect(() => {
    void loadRefs();
  }, [loadRefs]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const showInitialSpinner = !refsReady;

  const libellesForSelectedOffer = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.etablissementServiceId === watchEtabService) {
        set.add(r.libelle.trim().toLowerCase());
      }
    }
    return set;
  }, [rows, watchEtabService]);

  const catalogOptionsForCreate = useMemo(() => {
    return catalog.filter((c) => !libellesForSelectedOffer.has(c.libelle.trim().toLowerCase()));
  }, [catalog, libellesForSelectedOffer]);

  function onFilterEtabChange(value: string) {
    setFilterEtabId(value);
    setFilterEsId("");
  }

  function openCreate() {
    setCreateMode("catalog");
    const firstEs =
      (filterEsId && esFilteredByEtab.find((e) => e._id === filterEsId)?._id) ||
      esFilteredByEtab[0]?._id ||
      "";
    createForm.reset({
      etablissementService: firstEs,
      caracteristiqueCatalogId: "",
      libelle: "",
      valeur: "",
    });
    setCreateOpen(true);
  }

  function openEdit(row: EscTableRow) {
    setEditRow(row);
    editForm.reset({ libelle: row.libelle, valeur: row.valeur });
    setEditOpen(true);
  }

  async function submitCreate(values: CreateFormValues) {
    if (!values.etablissementService) {
      message.warning(labels.selectPlaceholder);
      return;
    }
    if (!values.valeur.trim()) {
      message.warning(labels.valeurRequired);
      return;
    }
    try {
      if (createMode === "catalog") {
        if (!values.caracteristiqueCatalogId) {
          message.warning(labels.selectPlaceholder);
          return;
        }
        await createProviderEsc(values.etablissementService, {
          caracteristiqueCatalogId: values.caracteristiqueCatalogId,
          valeur: values.valeur.trim(),
        });
      } else {
        if (!values.libelle.trim()) {
          message.warning(labels.libelleRequired);
          return;
        }
        await createProviderEsc(values.etablissementService, {
          libelle: values.libelle.trim(),
          valeur: values.valeur.trim(),
        });
      }
      message.success(labels.formSave);
      setCreateOpen(false);
      await loadRows();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("existe") || msg.toLowerCase().includes("already")) {
        message.error(labels.conflictError);
      } else {
        message.error(labels.saveError);
      }
    }
  }

  async function submitEdit(values: EditFormValues) {
    if (!editRow) return;
    if (!values.libelle.trim() || !values.valeur.trim()) {
      message.warning(labels.libelleRequired);
      return;
    }
    const payload: UpdateProviderEscPayload = {
      libelle: values.libelle.trim(),
      valeur: values.valeur.trim(),
    };
    try {
      await updateProviderEsc(editRow._id, payload);
      message.success(labels.formSave);
      setEditOpen(false);
      setEditRow(null);
      await loadRows();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("existe") || msg.toLowerCase().includes("already")) {
        message.error(labels.conflictError);
      } else {
        message.error(labels.saveError);
      }
    }
  }

  function confirmDelete(row: EscTableRow) {
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: labels.deleteConfirmDescription,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      onOk: async () => {
        try {
          await deleteProviderEsc(row._id);
          message.success(labels.deleteSuccess);
          await loadRows();
        } catch {
          message.error(labels.deleteError);
        }
      },
    });
  }

  const noOffers = esAssignments.length === 0;

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{labels.pageTitle}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{labels.pageDescription}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{labels.filterEtabLabel}</span>
            <select
              className={cn(
                "h-9 min-w-[200px] rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              value={filterEtabId}
              onChange={(e) => onFilterEtabChange(e.target.value)}
            >
              <option value="">{labels.filterEtabAll}</option>
              {etabsOptions.map(([id, nom]) => (
                <option key={id} value={id}>
                  {nom}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{labels.filterOfferLabel}</span>
            <select
              className={cn(
                "h-9 min-w-[220px] rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              value={filterEsId}
              onChange={(e) => setFilterEsId(e.target.value)}
              disabled={esFilteredByEtab.length === 0}
            >
              <option value="">{labels.filterOfferAll}</option>
              {esFilteredByEtab.map((es) => (
                <option key={es._id} value={es._id}>
                  {offerLabel(es)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "default" }), "shrink-0")}
            onClick={openCreate}
            disabled={refsError || noOffers || esFilteredByEtab.length === 0}
          >
            {labels.addButton}
          </button>
        </div>
      </header>

      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-0">
          {showInitialSpinner ? (
            <div className="flex min-h-[200px] items-center justify-center p-8 text-sm text-muted-foreground">
              {labels.loading}
            </div>
          ) : noOffers ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <p className="max-w-md text-sm text-muted-foreground">{labels.emptyNoOffers}</p>
            </div>
          ) : loading ? (
            <div className="flex min-h-[200px] items-center justify-center p-8 text-sm text-muted-foreground">
              {labels.loading}
            </div>
          ) : error ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" onClick={() => void loadRows()}>
                {labels.retry}
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <p className="max-w-md text-sm text-muted-foreground">{labels.empty}</p>
              <Button type="button" variant="secondary" onClick={openCreate}>
                {labels.addButton}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.colEtablissement}</TableHead>
                  <TableHead>{labels.colService}</TableHead>
                  <TableHead>{labels.colLibelle}</TableHead>
                  <TableHead className="hidden md:table-cell">{labels.colValeur}</TableHead>
                  <TableHead>{labels.colDateCreation}</TableHead>
                  <TableHead className="text-right">{labels.colActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell className="font-medium">{row.etablissementNom}</TableCell>
                    <TableCell>{row.serviceNom}</TableCell>
                    <TableCell>{row.libelle}</TableCell>
                    <TableCell className="hidden max-w-[240px] truncate text-muted-foreground md:table-cell">
                      {row.valeur}
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
                ))}
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
        <form className="mt-4 space-y-4" onSubmit={createForm.handleSubmit(submitCreate)}>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={createMode === "catalog" ? "default" : "outline"}
              size="sm"
              onClick={() => setCreateMode("catalog")}
            >
              {labels.formModeCatalog}
            </Button>
            <Button
              type="button"
              variant={createMode === "free" ? "default" : "outline"}
              size="sm"
              onClick={() => setCreateMode("free")}
            >
              {labels.formModeFree}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{labels.formOffer}</Label>
            <select
              className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              {...createForm.register("etablissementService")}
            >
              <option value="">{labels.selectPlaceholder}</option>
              {esFilteredByEtab.map((es) => (
                <option key={es._id} value={es._id}>
                  {offerLabel(es)}
                </option>
              ))}
            </select>
          </div>

          {createMode === "catalog" ? (
            <div className="space-y-2">
              <Label>{labels.formCatalogPick}</Label>
              <select
                className={cn(
                  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm",
                  "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
                )}
                disabled={!watchEtabService || catalogOptionsForCreate.length === 0}
                {...createForm.register("caracteristiqueCatalogId")}
              >
                <option value="">{labels.selectPlaceholder}</option>
                {catalogOptionsForCreate.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.libelle}
                  </option>
                ))}
              </select>
              {watchEtabService && catalogOptionsForCreate.length === 0 ? (
                <p className="text-xs text-muted-foreground">{labels.noCatalogLeft}</p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{labels.formLibelle}</Label>
              <Input {...createForm.register("libelle")} placeholder={labels.libellePlaceholder} />
            </div>
          )}

          <div className="space-y-2">
            <Label>{labels.formValeur}</Label>
            <Textarea {...createForm.register("valeur")} placeholder={labels.valeurPlaceholder} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              {labels.formCancel}
            </Button>
            <Button
              type="submit"
              disabled={
                createMode === "catalog" &&
                !!watchEtabService &&
                catalogOptionsForCreate.length === 0
              }
            >
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
        width={520}
      >
        <p className="mt-1 text-xs text-muted-foreground">{labels.editHint}</p>
        <form className="mt-4 space-y-4" onSubmit={editForm.handleSubmit(submitEdit)}>
          <div className="space-y-2">
            <Label>{labels.formLibelle}</Label>
            <Input {...editForm.register("libelle")} />
          </div>
          <div className="space-y-2">
            <Label>{labels.formValeur}</Label>
            <Textarea {...editForm.register("valeur")} rows={4} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
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
