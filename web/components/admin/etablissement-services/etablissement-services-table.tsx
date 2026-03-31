"use client";

/**
 * Tableau des assignations établissement ↔ service catalogue.
 * Liste chargée depuis l’API (pagination agrégée côté client), recherche locale, modales création / édition / suppression.
 */
import { Modal, Select, Spin, Switch, message } from "antd";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import { LocationPicker } from "@/components/shared/LocationPicker";
import { ApiRequestError, matchBackendMessagesToFields } from "@/lib/api/api-request-error";
import { fetchEtablissements } from "@/lib/api/etablissements";
import {
  createEtablissementService,
  deleteEtablissementService,
  fetchAllEtablissementAssignments,
  updateEtablissementService,
  type UpdateEtablissementServicePayload,
} from "@/lib/api/etablissement-services";
import { fetchServices } from "@/lib/api/services";
import { displayRefName } from "@/lib/catalog-display";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { EtablissementListItem, ServiceDoc } from "@/lib/types/catalog";
import type { EtablissementServiceAssignment } from "@/lib/types/etablissement-service";
import { refId } from "@/lib/types/etablissement-service";
import {
  hasSpecificGeo,
  lineAdresseService,
  validateAssignmentGeoStrings,
} from "@/lib/location/etablissement-service-location";
import { parseCoordField } from "@/lib/validation/coordinates";
import { cn } from "@/lib/utils";

const FORM_CREATE_ID = "admin-etab-svc-create";
const FORM_EDIT_ID = "admin-etab-svc-edit";

type Labels = CommonDictionary["adminEtablissementServices"];

export type EtablissementServicesTableProps = {
  labels: Labels;
  className?: string;
};

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

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

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatPrix(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

/** IDs des services déjà liés à cet établissement (pour griser les options à la création). */
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
  useSpecificLocation: boolean;
  adresse: string;
  latitude: string;
  longitude: string;
  location_label: string;
  location_type: string;
};

type EditFormValues = {
  prix: string;
  commentaire: string;
  useSpecificLocation: boolean;
  adresse: string;
  latitude: string;
  longitude: string;
  location_label: string;
  location_type: string;
};

export function EtablissementServicesTable({ labels, className }: EtablissementServicesTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<EtablissementServiceAssignment[]>([]);
  const [etablissements, setEtablissements] = useState<EtablissementListItem[]>([]);
  const [servicesCatalog, setServicesCatalog] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<EtablissementServiceAssignment | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await fetchAllEtablissementAssignments();
      setRows(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : labels.loadError;
      setListError(msg);
      message.error(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [labels.loadError]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [etabs, svcs] = await Promise.all([fetchEtablissements(), fetchServices()]);
      setEtablissements(etabs);
      setServicesCatalog(svcs);
    } catch (e) {
      message.error(e instanceof Error ? e.message : labels.loadErrorOptions);
    } finally {
      setOptionsLoading(false);
    }
  }, [labels.loadErrorOptions]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (createOpen) void loadOptions();
  }, [createOpen, loadOptions]);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return rows;
    return rows.filter((r) => {
      const en = etablissementNom(r).toLowerCase();
      const sn = serviceNom(r).toLowerCase();
      const dom = serviceDomaineLabel(r).toLowerCase();
      const com = (r.commentaire ?? "").toLowerCase();
      const px = formatPrix(r.prix).toLowerCase();
      return (
        en.includes(q) || sn.includes(q) || dom.includes(q) || com.includes(q) || px.includes(q)
      );
    });
  }, [query, rows]);

  const openCreate = () => {
    setCreateOpen(true);
  };

  const openEdit = (row: EtablissementServiceAssignment) => {
    setEditingRow(row);
    setEditOpen(true);
  };

  const confirmDelete = (row: EtablissementServiceAssignment) => {
    const name = `${etablissementNom(row)} → ${serviceNom(row)}`;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` (${name})` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteEtablissementService(row._id);
          message.success(labels.deleteSuccess);
          setRows((prev) => prev.filter((r) => r._id !== row._id));
        } catch (e) {
          message.error(e instanceof Error ? e.message : labels.loadError);
        }
      },
    });
  };

  const toolbarBtn =
    "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium md:h-10 md:min-h-10";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="h-11 min-h-11 rounded-lg pl-10 pr-3"
            placeholder={labels.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={labels.searchPlaceholder}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button type="button" className={toolbarBtn} onClick={openCreate}>
            <Plus className="size-4 shrink-0" aria-hidden />
            {labels.addAssignment}
          </Button>
        </div>
      </div>

      {listError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </p>
      ) : null}

      <Spin spinning={loading} tip={labels.loading}>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold text-foreground">{labels.colEtablissement}</TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colService}</TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colDomaine}</TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colStatut}</TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colPrix}</TableHead>
                <TableHead className="hidden font-semibold text-foreground lg:table-cell">
                  {labels.colCommentaire}
                </TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colDateCreation}</TableHead>
                <TableHead className="w-[140px] text-end font-semibold text-foreground">
                  {labels.colActions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {labels.empty}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => {
                  const actif = etablissementActif(row);
                  return (
                    <TableRow key={row._id} className="border-border/50">
                      <TableCell className="font-medium text-foreground">{etablissementNom(row)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-foreground">{serviceNom(row)}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {serviceDomaineLabel(row)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {actif === undefined ? (
                          "—"
                        ) : actif ? (
                          <span className="text-emerald-700 dark:text-emerald-400">{labels.statutActive}</span>
                        ) : (
                          <span className="text-muted-foreground">{labels.statutInactive}</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {formatPrix(row.prix)}
                      </TableCell>
                      <TableCell className="hidden max-w-[180px] truncate text-muted-foreground text-sm lg:table-cell">
                        {row.commentaire?.trim() ? row.commentaire : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {formatDate(row.createdAt)}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-muted-foreground hover:text-foreground"
                            aria-label={labels.actionEdit}
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-muted-foreground hover:text-destructive"
                            aria-label={labels.actionDelete}
                            onClick={() => confirmDelete(row)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Spin>

      <CreateAssignmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        labels={labels}
        rows={rows}
        etablissements={etablissements}
        servicesCatalog={servicesCatalog}
        optionsLoading={optionsLoading}
        formId={FORM_CREATE_ID}
        onSuccess={async () => {
          await loadList();
          setCreateOpen(false);
        }}
      />

      <EditAssignmentModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingRow(null);
        }}
        labels={labels}
        row={editingRow}
        formId={FORM_EDIT_ID}
        onSuccess={async () => {
          await loadList();
          setEditOpen(false);
          setEditingRow(null);
        }}
      />
    </div>
  );
}

function CreateAssignmentModal({
  open,
  onClose,
  labels,
  rows,
  etablissements,
  servicesCatalog,
  optionsLoading,
  formId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  rows: EtablissementServiceAssignment[];
  etablissements: EtablissementListItem[];
  servicesCatalog: ServiceDoc[];
  optionsLoading: boolean;
  formId: string;
  onSuccess: () => void | Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateFormValues>({
    shouldUnregister: false,
    defaultValues: {
      etablissement: "",
      service: "",
      prix: "",
      commentaire: "",
      useSpecificLocation: false,
      adresse: "",
      latitude: "",
      longitude: "",
      location_label: "",
      location_type: "",
    },
  });

  useEffect(() => {
    register("adresse");
    register("latitude");
    register("longitude");
    register("location_label");
    register("location_type");
  }, [register]);

  const etabId = watch("etablissement");
  const useSpecific = watch("useSpecificLocation");
  const adresse = watch("adresse");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const locationPickerLabels = useMemo(
    () => ({
      addressLineLabel: labels.addressLineLabel,
      mapsLoading: labels.mapsLoading,
      mapsLoadError: labels.mapsLoadError,
      mapsMissingKey: labels.mapsMissingKey,
      mapsSearchPlaceholder: labels.mapsSearchPlaceholder,
      mapsUseTypedCoords: labels.mapsUseTypedCoords,
      mapsResetLocation: labels.mapsResetLocation,
      mapsPickerHint: labels.mapsPickerHint,
      formLatitude: labels.formLatitude,
      formLongitude: labels.formLongitude,
    }),
    [labels],
  );

  useEffect(() => {
    if (!open) return;
    reset({
      etablissement: "",
      service: "",
      prix: "",
      commentaire: "",
      useSpecificLocation: false,
      adresse: "",
      latitude: "",
      longitude: "",
      location_label: "",
      location_type: "",
    });
  }, [open, reset]);

  useEffect(() => {
    setValue("service", "");
  }, [etabId, setValue]);

  const takenIds = useMemo(
    () => (etabId ? assignedServiceIdsForEtablissement(rows, etabId) : new Set<string>()),
    [etabId, rows],
  );

  const etabOptions = useMemo(
    () => etablissements.map((e) => ({ value: e._id, label: e.nom })),
    [etablissements],
  );

  const serviceOptions = useMemo(
    () =>
      servicesCatalog.map((s) => ({
        value: s._id,
        label: s.nom,
        disabled: takenIds.has(s._id),
      })),
    [servicesCatalog, takenIds],
  );

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const onSubmit = async (values: CreateFormValues) => {
    if (!values.etablissement || !values.service) {
      message.error(labels.selectPlaceholder);
      return;
    }
    const prixRaw = values.prix.trim();
    let prix: number | undefined;
    if (prixRaw !== "") {
      const n = Number(prixRaw.replace(",", "."));
      if (Number.isNaN(n) || n < 0) {
        message.error(labels.prixInvalid);
        return;
      }
      prix = n;
    }
    const commentaire = values.commentaire.trim();

    if (values.useSpecificLocation) {
      clearErrors(["latitude", "longitude", "adresse"]);
      const geoErr = validateAssignmentGeoStrings(values.latitude, values.longitude, labels);
      if (geoErr) {
        if (geoErr.latitude) setError("latitude", { message: geoErr.latitude });
        if (geoErr.longitude) setError("longitude", { message: geoErr.longitude });
        return;
      }
    }

    const lat = parseCoordField(values.latitude);
    const lng = parseCoordField(values.longitude);

    setSubmitting(true);
    try {
      if (!values.useSpecificLocation) {
        await createEtablissementService({
          etablissement: values.etablissement,
          service: values.service,
          ...(prix !== undefined ? { prix } : {}),
          ...(commentaire !== "" ? { commentaire } : {}),
        });
      } else {
        await createEtablissementService({
          etablissement: values.etablissement,
          service: values.service,
          ...(prix !== undefined ? { prix } : {}),
          ...(commentaire !== "" ? { commentaire } : {}),
          ...(values.adresse.trim() !== "" ? { adresse: values.adresse.trim() } : {}),
          ...(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : {}),
          ...(values.location_label.trim() !== ""
            ? { location_label: values.location_label.trim() }
            : {}),
          ...(values.location_type.trim() !== ""
            ? { location_type: values.location_type.trim() }
            : {}),
        });
      }
      message.success(labels.saveSuccess);
      await onSuccess();
      reset({
        etablissement: "",
        service: "",
        prix: "",
        commentaire: "",
        useSpecificLocation: false,
        adresse: "",
        latitude: "",
        longitude: "",
        location_label: "",
        location_type: "",
      });
    } catch (e) {
      if (e instanceof ApiRequestError) {
        const mapped = matchBackendMessagesToFields(e.messages);
        if (mapped.adresse) setError("adresse", { message: mapped.adresse });
        if (mapped.latitude) setError("latitude", { message: mapped.latitude });
        if (mapped.longitude) setError("longitude", { message: mapped.longitude });
        if (mapped.location_label) {
          setError("location_label", { message: mapped.location_label });
        }
        if (mapped.location_type) {
          setError("location_type", { message: mapped.location_type });
        }
      }
      message.error(e instanceof Error ? e.message : labels.loadError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={labels.formCreateTitle}
      open={open}
      onCancel={handleClose}
      width={720}
      footer={
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            {labels.formCancel}
          </Button>
          <Button type="submit" form={formId} disabled={submitting || optionsLoading}>
            {labels.formSave}
          </Button>
        </div>
      }
      destroyOnClose
    >
      <Spin spinning={optionsLoading}>
        <form id={formId} className="max-h-[75vh] space-y-4 overflow-y-auto pt-2 pr-1" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>{labels.formEtablissement}</Label>
            <Controller
              name="etablissement"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={labels.selectPlaceholder}
                  className="w-full"
                  options={etabOptions}
                  value={field.value || undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.formService}</Label>
            <Controller
              name="service"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={labels.selectPlaceholder}
                  className="w-full"
                  options={serviceOptions}
                  value={field.value || undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-prix`}>{labels.formPrix}</Label>
            <Input
              id={`${formId}-prix`}
              type="text"
              inputMode="decimal"
              placeholder={labels.prixPlaceholder}
              {...register("prix")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-commentaire`}>{labels.formCommentaire}</Label>
            <Textarea
              id={`${formId}-commentaire`}
              rows={3}
              placeholder={labels.commentairePlaceholder}
              {...register("commentaire")}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <div className="space-y-0.5">
              <Label htmlFor={`${formId}-specific`} className="font-medium">
                {labels.specificLocationToggle}
              </Label>
            </div>
            <Controller
              name="useSpecificLocation"
              control={control}
              render={({ field }) => (
                <Switch
                  id={`${formId}-specific`}
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={submitting}
                />
              )}
            />
          </div>

          {!useSpecific ? (
            <p className="text-sm text-muted-foreground">{labels.specificLocationOffHelp}</p>
          ) : (
            <section className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
              <LocationPicker
                value={{
                  address: adresse ?? "",
                  latitude: latitude ?? "",
                  longitude: longitude ?? "",
                }}
                onChange={(next) => {
                  setValue("adresse", next.address, { shouldDirty: true, shouldValidate: true });
                  setValue("latitude", next.latitude, { shouldDirty: true, shouldValidate: true });
                  setValue("longitude", next.longitude, { shouldDirty: true, shouldValidate: true });
                }}
                labels={locationPickerLabels}
                disabled={submitting}
              />
              {errors.adresse ? <p className="text-xs text-destructive">{errors.adresse.message}</p> : null}
              {errors.latitude ? <p className="text-xs text-destructive">{errors.latitude.message}</p> : null}
              {errors.longitude ? <p className="text-xs text-destructive">{errors.longitude.message}</p> : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-loc-label`}>{labels.formLocationLabel}</Label>
                  <Input
                    id={`${formId}-loc-label`}
                    placeholder="ex. Accueil, Spa"
                    {...register("location_label")}
                  />
                  {errors.location_label ? (
                    <p className="text-xs text-destructive">{errors.location_label.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-loc-type`}>{labels.formLocationType}</Label>
                  <Input
                    id={`${formId}-loc-type`}
                    placeholder="ex. onsite, customer_site"
                    {...register("location_type")}
                  />
                  {errors.location_type ? (
                    <p className="text-xs text-destructive">{errors.location_type.message}</p>
                  ) : null}
                </div>
              </div>
            </section>
          )}
        </form>
      </Spin>
    </Modal>
  );
}

function EditAssignmentModal({
  open,
  onClose,
  labels,
  row,
  formId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  row: EtablissementServiceAssignment | null;
  formId: string;
  onSuccess: () => void | Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const hadGeoInitially = useMemo(
    () => (row ? hasSpecificGeo(row) : false),
    [row],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EditFormValues>({
    shouldUnregister: false,
    defaultValues: {
      prix: "",
      commentaire: "",
      useSpecificLocation: false,
      adresse: "",
      latitude: "",
      longitude: "",
      location_label: "",
      location_type: "",
    },
  });

  useEffect(() => {
    register("adresse");
    register("latitude");
    register("longitude");
    register("location_label");
    register("location_type");
  }, [register]);

  const useSpecific = watch("useSpecificLocation");
  const adresse = watch("adresse");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const locationPickerLabels = useMemo(
    () => ({
      addressLineLabel: labels.addressLineLabel,
      mapsLoading: labels.mapsLoading,
      mapsLoadError: labels.mapsLoadError,
      mapsMissingKey: labels.mapsMissingKey,
      mapsSearchPlaceholder: labels.mapsSearchPlaceholder,
      mapsUseTypedCoords: labels.mapsUseTypedCoords,
      mapsResetLocation: labels.mapsResetLocation,
      mapsPickerHint: labels.mapsPickerHint,
      formLatitude: labels.formLatitude,
      formLongitude: labels.formLongitude,
    }),
    [labels],
  );

  useEffect(() => {
    if (!open || !row) return;
    const p = row.prix;
    const lat = row.latitude;
    const lng = row.longitude;
    reset({
      prix: p !== undefined && p !== null ? String(p) : "",
      commentaire: row.commentaire ?? "",
      useSpecificLocation: hasSpecificGeo(row),
      adresse: lineAdresseService(row),
      latitude: lat != null && !Number.isNaN(Number(lat)) ? String(lat) : "",
      longitude: lng != null && !Number.isNaN(Number(lng)) ? String(lng) : "",
      location_label: row.location_label ?? "",
      location_type: row.location_type ?? "",
    });
  }, [open, row, reset]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const onSubmit = async (values: EditFormValues) => {
    if (!row) return;
    const prixRaw = values.prix.trim();
    let prix: number | undefined;
    if (prixRaw !== "") {
      const n = Number(prixRaw.replace(",", "."));
      if (Number.isNaN(n) || n < 0) {
        message.error(labels.prixInvalid);
        return;
      }
      prix = n;
    } else {
      prix = undefined;
    }
    const commentaire = values.commentaire.trim();

    if (values.useSpecificLocation) {
      clearErrors(["latitude", "longitude", "adresse"]);
      const geoErr = validateAssignmentGeoStrings(values.latitude, values.longitude, labels);
      if (geoErr) {
        if (geoErr.latitude) setError("latitude", { message: geoErr.latitude });
        if (geoErr.longitude) setError("longitude", { message: geoErr.longitude });
        return;
      }
    }

    const lat = parseCoordField(values.latitude);
    const lng = parseCoordField(values.longitude);

    setSubmitting(true);
    try {
      const base: UpdateEtablissementServicePayload = {
        commentaire,
        ...(prixRaw !== "" ? { prix: prix as number } : {}),
      };

      if (!values.useSpecificLocation) {
        if (hadGeoInitially) {
          base.latitude = null;
          base.longitude = null;
          base.adresse = "";
          base.location_label = "";
          base.location_type = "";
        }
        await updateEtablissementService(row._id, base);
      } else {
        base.adresse = values.adresse.trim() !== "" ? values.adresse.trim() : "";
        if (lat !== null && lng !== null) {
          base.latitude = lat;
          base.longitude = lng;
        }
        if (values.location_label.trim() !== "") {
          base.location_label = values.location_label.trim();
        } else {
          base.location_label = "";
        }
        if (values.location_type.trim() !== "") {
          base.location_type = values.location_type.trim();
        } else {
          base.location_type = "";
        }
        await updateEtablissementService(row._id, base);
      }

      message.success(labels.saveSuccess);
      await onSuccess();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        const mapped = matchBackendMessagesToFields(e.messages);
        if (mapped.adresse) setError("adresse", { message: mapped.adresse });
        if (mapped.latitude) setError("latitude", { message: mapped.latitude });
        if (mapped.longitude) setError("longitude", { message: mapped.longitude });
        if (mapped.location_label) {
          setError("location_label", { message: mapped.location_label });
        }
        if (mapped.location_type) {
          setError("location_type", { message: mapped.location_type });
        }
      }
      message.error(e instanceof Error ? e.message : labels.loadError);
    } finally {
      setSubmitting(false);
    }
  };

  if (!row) return null;

  return (
    <Modal
      title={labels.formEditTitle}
      open={open}
      onCancel={handleClose}
      width={720}
      footer={
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            {labels.formCancel}
          </Button>
          <Button type="submit" form={formId} disabled={submitting}>
            {labels.formSave}
          </Button>
        </div>
      }
      destroyOnClose
    >
      <form
        id={formId}
        className="max-h-[75vh] space-y-4 overflow-y-auto pt-2 pr-1"
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="text-sm text-muted-foreground">{labels.editHint}</p>
        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
          <p>
            <span className="font-medium text-foreground">{labels.formEtablissement}:</span>{" "}
            {etablissementNom(row)}
          </p>
          <p className="mt-1">
            <span className="font-medium text-foreground">{labels.formService}:</span> {serviceNom(row)}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-prix`}>{labels.formPrix}</Label>
          <Input
            id={`${formId}-prix`}
            type="text"
            inputMode="decimal"
            placeholder={labels.prixPlaceholder}
            {...register("prix")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-commentaire`}>{labels.formCommentaire}</Label>
          <Textarea
            id={`${formId}-commentaire`}
            rows={4}
            placeholder={labels.commentairePlaceholder}
            {...register("commentaire")}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          <div className="space-y-0.5">
            <Label htmlFor={`${formId}-specific-edit`} className="font-medium">
              {labels.specificLocationToggle}
            </Label>
          </div>
          <Controller
            name="useSpecificLocation"
            control={control}
            render={({ field }) => (
              <Switch
                id={`${formId}-specific-edit`}
                checked={field.value}
                onChange={field.onChange}
                disabled={submitting}
              />
            )}
          />
        </div>

        {!useSpecific ? (
          <p className="text-sm text-muted-foreground">{labels.specificLocationOffHelp}</p>
        ) : (
          <section className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
            <LocationPicker
              value={{
                address: adresse ?? "",
                latitude: latitude ?? "",
                longitude: longitude ?? "",
              }}
              onChange={(next) => {
                setValue("adresse", next.address, { shouldDirty: true, shouldValidate: true });
                setValue("latitude", next.latitude, { shouldDirty: true, shouldValidate: true });
                setValue("longitude", next.longitude, { shouldDirty: true, shouldValidate: true });
              }}
              labels={locationPickerLabels}
              disabled={submitting}
            />
            {errors.adresse ? <p className="text-xs text-destructive">{errors.adresse.message}</p> : null}
            {errors.latitude ? <p className="text-xs text-destructive">{errors.latitude.message}</p> : null}
            {errors.longitude ? <p className="text-xs text-destructive">{errors.longitude.message}</p> : null}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${formId}-loc-label`}>{labels.formLocationLabel}</Label>
                <Input
                  id={`${formId}-loc-label`}
                  placeholder="ex. Accueil, Spa"
                  {...register("location_label")}
                />
                {errors.location_label ? (
                  <p className="text-xs text-destructive">{errors.location_label.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${formId}-loc-type`}>{labels.formLocationType}</Label>
                <Input
                  id={`${formId}-loc-type`}
                  placeholder="ex. onsite, customer_site"
                  {...register("location_type")}
                />
                {errors.location_type ? (
                  <p className="text-xs text-destructive">{errors.location_type.message}</p>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </form>
    </Modal>
  );
}
