"use client";

import { Modal, Spin, message } from "antd";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AdminIconCell } from "@/components/admin/admin-icon-cell";
import { IconField } from "@/components/admin/icon-field";
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
  createDomaine,
  deleteDomaine,
  fetchDomaines,
  updateDomaine,
} from "@/lib/api/domaines";
import { DOMAIN_ICON_PRESETS } from "@/lib/admin-icon-presets";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { DomaineDoc } from "@/lib/types/catalog";
import { cn } from "@/lib/utils";

const FORM_ID = "admin-domaine-form";

type Labels = CommonDictionary["adminServicesCatalog"];

export type DomainesTableProps = {
  labels: Labels;
  className?: string;
};

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

type DomaineFormValues = {
  nom: string;
  description: string;
  icon: string;
};

export function DomainesTable({ labels, className }: DomainesTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<DomaineDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await fetchDomaines();
      setRows(data);
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
      const nom = r.nom?.toLowerCase() ?? "";
      const desc = (r.description ?? "").toLowerCase();
      const icon = (r.icon ?? "").toLowerCase();
      return nom.includes(q) || desc.includes(q) || icon.includes(q);
    });
  }, [query, rows]);

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

  const openEdit = (row: DomaineDoc) => {
    setEditingId(row._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const confirmDelete = (row: DomaineDoc) => {
    const name = row.nom;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` « ${name} »` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteDomaine(row._id);
          message.success("Domaine supprimé.");
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
            placeholder={labels.domainesSearchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={labels.domainesSearchPlaceholder}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button type="button" className={toolbarBtn} onClick={openCreate}>
            <Plus className="size-4 shrink-0" aria-hidden />
            {labels.domainesAddButton}
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
                <TableHead className="font-semibold text-foreground">{labels.colNom}</TableHead>
                <TableHead className="w-[88px] max-w-[88px] text-center font-semibold text-foreground">
                  {labels.colIcon}
                </TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colDescription}</TableHead>
                <TableHead className="font-semibold text-foreground">{labels.colDateCreation}</TableHead>
                <TableHead className="w-[140px] text-end font-semibold text-foreground">
                  {labels.colActions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {labels.domainesEmpty}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row._id} className="border-border/50">
                    <TableCell className="font-medium text-foreground">{row.nom}</TableCell>
                    <TableCell className="align-middle text-center">
                      <AdminIconCell value={row.icon} />
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-muted-foreground">
                      {row.description ?? "—"}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Spin>

      <DomaineFormModal
        open={modalOpen}
        onClose={closeModal}
        labels={labels}
        editingId={editingId}
        initialRow={editingId ? rows.find((r) => r._id === editingId) : undefined}
        isEdit={isEdit}
        onSuccess={loadList}
        formId={FORM_ID}
      />
    </div>
  );
}

function DomaineFormModal({
  open,
  onClose,
  labels,
  editingId,
  initialRow,
  isEdit,
  onSuccess,
  formId,
}: {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  editingId: string | null;
  initialRow?: DomaineDoc;
  isEdit: boolean;
  onSuccess: () => void | Promise<void>;
  formId: string;
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DomaineFormValues>({
    defaultValues: { nom: "", description: "", icon: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      nom: initialRow?.nom ?? "",
      description: initialRow?.description ?? "",
      icon: initialRow?.icon ?? "",
    });
  }, [open, editingId, initialRow?.nom, initialRow?.description, initialRow?.icon, reset]);

  const title = isEdit ? labels.domaineModalEdit : labels.domaineModalCreate;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const onSubmit = async (values: DomaineFormValues) => {
    const nom = values.nom.trim();
    if (!nom) {
      message.error("Le nom est requis.");
      return;
    }
    const description = values.description.trim();
    const iconTrim = values.icon.trim();
    const payload = {
      nom,
      ...(description !== "" ? { description } : {}),
    };

    setSubmitting(true);
    try {
      if (isEdit && editingId) {
        await updateDomaine(editingId, { ...payload, icon: iconTrim });
        message.success("Domaine mis à jour.");
      } else {
        await createDomaine({
          ...payload,
          ...(iconTrim ? { icon: iconTrim } : {}),
        });
        message.success("Domaine créé.");
      }
      await onSuccess();
      onClose();
      reset({ nom: "", description: "", icon: "" });
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
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
          <Label htmlFor={`${formId}-nom`}>{labels.colNom}</Label>
          <Input
            id={`${formId}-nom`}
            {...register("nom", { required: true })}
            aria-invalid={errors.nom ? "true" : "false"}
          />
          {errors.nom ? <p className="text-sm text-destructive">Requis</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-description`}>{labels.colDescription}</Label>
          <Input id={`${formId}-description`} {...register("description")} />
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
              presets={DOMAIN_ICON_PRESETS}
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
      </form>
    </Modal>
  );
}
