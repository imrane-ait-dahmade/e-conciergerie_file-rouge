"use client";

import { Modal, Select, Spin, message } from "antd";
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
import { fetchDomaines } from "@/lib/api/domaines";
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
} from "@/lib/api/services";
import { displayRefName } from "@/lib/catalog-display";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { DomaineDoc, ServiceDoc } from "@/lib/types/catalog";
import { cn } from "@/lib/utils";

const FORM_ID = "admin-service-form";

type Labels = CommonDictionary["adminServicesCatalog"];

export type ServicesTableProps = {
  labels: Labels;
  className?: string;
};

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

type ServiceFormValues = {
  nom: string;
  description: string;
  domaine: string;
};

export function ServicesTable({ labels, className }: ServicesTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [domaines, setDomaines] = useState<DomaineDoc[]>([]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const [servicesData, domainesData] = await Promise.all([
        fetchServices(),
        fetchDomaines(),
      ]);
      setRows(servicesData);
      setDomaines(domainesData);
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
      const dom = displayRefName(r.domaine).toLowerCase();
      return nom.includes(q) || desc.includes(q) || dom.includes(q);
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

  const openEdit = (row: ServiceDoc) => {
    setEditingId(row._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const confirmDelete = (row: ServiceDoc) => {
    const name = row.nom;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` « ${name} »` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteService(row._id);
          message.success("Service supprimé.");
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
            placeholder={labels.servicesSearchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={labels.servicesSearchPlaceholder}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button type="button" className={toolbarBtn} onClick={openCreate}>
            <Plus className="size-4 shrink-0" aria-hidden />
            {labels.servicesAddButton}
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
                <TableHead className="font-semibold text-foreground">{labels.colDomaine}</TableHead>
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
                    {labels.servicesEmpty}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row._id} className="border-border/50">
                    <TableCell className="font-medium text-foreground">{row.nom}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {displayRefName(row.domaine)}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground text-sm">
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

      <ServiceFormModal
        open={modalOpen}
        onClose={closeModal}
        labels={labels}
        editingId={editingId}
        initialRow={editingRow}
        isEdit={isEdit}
        domaines={domaines}
        onSuccess={loadList}
        formId={FORM_ID}
      />
    </div>
  );
}

function serviceDomaineId(s: ServiceDoc): string {
  const d = s.domaine;
  if (typeof d === "string") return d;
  return d?._id ?? "";
}

function ServiceFormModal({
  open,
  onClose,
  labels,
  editingId,
  initialRow,
  isEdit,
  domaines,
  onSuccess,
  formId,
}: {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  editingId: string | null;
  initialRow?: ServiceDoc;
  isEdit: boolean;
  domaines: DomaineDoc[];
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
  } = useForm<ServiceFormValues>({
    defaultValues: {
      nom: "",
      description: "",
      domaine: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      nom: initialRow?.nom ?? "",
      description: initialRow?.description ?? "",
      domaine: initialRow ? serviceDomaineId(initialRow) : "",
    });
  }, [open, editingId, initialRow, reset]);

  const title = isEdit ? labels.serviceModalEdit : labels.serviceModalCreate;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const onSubmit = async (values: ServiceFormValues) => {
    const nom = values.nom.trim();
    if (!nom) {
      message.error("Le nom est requis.");
      return;
    }
    if (!values.domaine) {
      message.error("Le domaine est requis.");
      return;
    }
    const description = values.description.trim();
    const payload = {
      nom,
      domaine: values.domaine,
      ...(description !== "" ? { description } : {}),
    };

    setSubmitting(true);
    try {
      if (isEdit && editingId) {
        await updateService(editingId, payload);
        message.success("Service mis à jour.");
      } else {
        await createService(payload);
        message.success("Service créé.");
      }
      await onSuccess();
      onClose();
      reset({ nom: "", description: "", domaine: "" });
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const domaineOptions = domaines.map((d) => ({ value: d._id, label: d.nom }));

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
        <div className="space-y-2">
          <Label>{labels.colDomaine}</Label>
          <Controller
            name="domaine"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={labels.selectPlaceholder}
                className="w-full"
                options={domaineOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.domaine ? <p className="text-sm text-destructive">Requis</p> : null}
        </div>
      </form>
    </Modal>
  );
}
