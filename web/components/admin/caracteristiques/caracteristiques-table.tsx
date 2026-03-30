"use client";

import { Modal, Select, Spin, message } from "antd";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AdminIconCell } from "@/components/admin/admin-icon-cell";
import { IconField } from "@/components/admin/icon-field";
import { Badge } from "@/components/ui/badge";
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
import {
  createCaracteristique,
  deleteCaracteristique,
  fetchCaracteristiques,
  updateCaracteristique,
} from "@/lib/api/caracteristiques";
import { fetchServices } from "@/lib/api/services";
import { displayRefName } from "@/lib/catalog-display";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { CARACTERISTIQUE_ICON_PRESETS } from "@/lib/admin-icon-presets";
import type { CaracteristiqueDoc, ServiceDoc } from "@/lib/types/catalog";
import { cn } from "@/lib/utils";

const FORM_ID = "admin-caracteristique-form";
const EMPTY_SELECT = "__none__";

type Labels = CommonDictionary["adminServicesCatalog"];

export type CaracteristiquesTableProps = {
  labels: Labels;
  className?: string;
};

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

type CaracteristiqueFormValues = {
  libelle: string;
  icon: string;
  service: string;
};

function resolveTypeKey(row: CaracteristiqueDoc): "service" | "general" {
  if (row.service) return "service";
  return "general";
}

function resolveTypeLabel(key: "service" | "general", labels: Labels): string {
  return key === "service"
    ? labels.caracteristiqueTypeService
    : labels.caracteristiqueTypeGeneral;
}

function refId(ref: CaracteristiqueDoc["service"]): string {
  if (ref == null) return "";
  if (typeof ref === "string") return ref;
  return ref._id;
}

export function CaracteristiquesTable({ labels, className }: CaracteristiquesTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CaracteristiqueDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceDoc[]>([]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const [caracData, servicesData] = await Promise.all([
        fetchCaracteristiques(),
        fetchServices(),
      ]);
      setRows(caracData);
      setServices(servicesData);
    } catch (e) {
      const msg = e instanceof Error ? e.message : labels.loadErrorList;
      setListError(msg);
      message.error(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [labels.loadErrorList]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return rows;
    return rows.filter((r) => {
      const lib = r.libelle?.toLowerCase() ?? "";
      const typeLabel = resolveTypeLabel(resolveTypeKey(r), labels).toLowerCase();
      const linked = displayRefName(r.service).toLowerCase();
      const icon = (r.icon ?? "").toLowerCase();
      return lib.includes(q) || typeLabel.includes(q) || linked.includes(q) || icon.includes(q);
    });
  }, [query, rows, labels]);

  const formatDate = (iso: string | undefined) => {
    if (!iso) return "—";
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (row: CaracteristiqueDoc) => {
    setEditingId(row._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const confirmDelete = (row: CaracteristiqueDoc) => {
    const name = row.libelle;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` « ${name} »` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCaracteristique(row._id);
          message.success("Caractéristique supprimée.");
          setRows((prev) => prev.filter((r) => r._id !== row._id));
        } catch (e) {
          message.error(e instanceof Error ? e.message : "Suppression impossible.");
        }
      },
    });
  };

  const toolbarBtn =
    "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium md:h-10 md:min-h-10";

  const isEdit = Boolean(editingId);
  const editingRow = editingId ? rows.find((r) => r._id === editingId) : undefined;

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
            placeholder={labels.caracteristiquesSearchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={labels.caracteristiquesSearchPlaceholder}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button type="button" className={toolbarBtn} onClick={openCreate}>
            <Plus className="size-4 shrink-0" aria-hidden />
            {labels.caracteristiquesAddButton}
          </Button>
        </div>
      </div>

      {listError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </p>
      ) : null}

      <Spin spinning={loading} tip={labels.loadingList}>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold text-foreground">{labels.colLibelle}</TableHead>
                <TableHead className="w-[88px] max-w-[88px] text-center font-semibold text-foreground">
                  {labels.colIcon}
                </TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colType}</TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colLinked}</TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colDateCreation}</TableHead>
                <TableHead className="w-[140px] text-end font-semibold text-foreground">
                  {labels.colActions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {labels.caracteristiquesEmpty}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => {
                  const typeKey = resolveTypeKey(row);
                  const serviceName = displayRefName(row.service);
                  const linked = typeKey === "service" ? serviceName : "—";
                  return (
                    <TableRow key={row._id} className="border-border/50">
                      <TableCell className="font-medium text-foreground">{row.libelle}</TableCell>
                      <TableCell className="align-middle text-center">
                        <AdminIconCell value={row.icon} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {resolveTypeLabel(typeKey, labels)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                        {linked}
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

      <CaracteristiqueFormModal
        open={modalOpen}
        onClose={closeModal}
        labels={labels}
        editingId={editingId}
        initialRow={editingRow}
        isEdit={isEdit}
        services={services}
        onSuccess={loadList}
        formId={FORM_ID}
      />
    </div>
  );
}

function CaracteristiqueFormModal({
  open,
  onClose,
  labels,
  editingId,
  initialRow,
  isEdit,
  services,
  onSuccess,
  formId,
}: {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  editingId: string | null;
  initialRow?: CaracteristiqueDoc;
  isEdit: boolean;
  services: ServiceDoc[];
  onSuccess: () => void | Promise<void>;
  formId: string;
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CaracteristiqueFormValues>({
    defaultValues: {
      libelle: "",
      icon: "",
      service: EMPTY_SELECT,
    },
  });

  useEffect(() => {
    if (!open) return;
    const sId = initialRow ? refId(initialRow.service) : "";
    reset({
      libelle: initialRow?.libelle ?? "",
      icon: initialRow?.icon ?? "",
      service: sId || EMPTY_SELECT,
    });
  }, [open, editingId, initialRow, reset]);

  const title = isEdit ? labels.caracteristiqueModalEdit : labels.caracteristiqueModalCreate;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const onSubmit = async (values: CaracteristiqueFormValues) => {
    const libelle = values.libelle.trim();
    if (!libelle) {
      message.error("Le libellé est requis.");
      return;
    }

    const serviceId = values.service === EMPTY_SELECT ? "" : values.service;
    const iconTrim = values.icon.trim();

    setSubmitting(true);
    try {
      if (isEdit && editingId) {
        await updateCaracteristique(editingId, {
          libelle,
          ...(serviceId ? { service: serviceId } : {}),
          icon: iconTrim,
        });
        message.success("Caractéristique mise à jour.");
      } else {
        await createCaracteristique({
          libelle,
          ...(serviceId ? { service: serviceId } : {}),
          ...(iconTrim ? { icon: iconTrim } : {}),
        });
        message.success("Caractéristique créée.");
      }
      await onSuccess();
      onClose();
      reset({
        libelle: "",
        icon: "",
        service: EMPTY_SELECT,
      });
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const serviceOptions = [
    { value: EMPTY_SELECT, label: "—" },
    ...services.map((s) => ({
      value: s._id,
      label: s.nom,
    })),
  ];

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      width={520}
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
      <form id={formId} className="space-y-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-libelle`}>{labels.colLibelle}</Label>
          <Input
            id={`${formId}-libelle`}
            {...register("libelle", { required: true })}
            aria-invalid={errors.libelle ? "true" : "false"}
          />
          {errors.libelle ? <p className="text-sm text-destructive">Requis</p> : null}
        </div>
        <Controller
          name="icon"
          control={control}
          rules={{ maxLength: { value: 512, message: labels.iconFieldMaxLength } }}
          render={({ field }) => (
            <IconField
              id={`${formId}-icon`}
              name={field.name}
              label={labels.iconFieldLabel}
              helperText={labels.iconFieldHelp}
              placeholder={labels.iconFieldPlaceholder}
              error={errors.icon?.message}
              presets={CARACTERISTIQUE_ICON_PRESETS}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={submitting}
              i18n={{
                tabLibrary: labels.iconPickerTabLibrary,
                tabCustom: labels.iconPickerTabCustom,
                none: labels.iconPickerNone,
                upload: labels.iconPickerUpload,
                uploading: labels.iconPickerUploading,
                customHint: labels.iconPickerCustomHint,
                preview: labels.iconPickerPreview,
                unknownKeyHint: labels.iconPickerUnknownKeyHint,
              }}
            />
          )}
        />
        <div className="space-y-2">
          <Label>{labels.caracteristiqueTypeService}</Label>
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={labels.selectPlaceholder}
                className="w-full"
                options={serviceOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
