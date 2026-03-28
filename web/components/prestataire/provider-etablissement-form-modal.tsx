"use client";

import { Modal, message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchCities, type CityListItem } from "@/lib/api/cities";
import { fetchDistricts, type DistrictListItem } from "@/lib/api/districts";
import {
  createProviderEtablissement,
  updateProviderEtablissement,
  type ProviderEtablissement,
} from "@/lib/api/provider-etablissements";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

type Labels = CommonDictionary["providerEtablissements"];

function geoId(ref: unknown): string {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  if (typeof ref === "object" && ref !== null && "_id" in ref) {
    return String((ref as { _id: unknown })._id);
  }
  return "";
}

const FORM_ID = "provider-etablissement-form";

type FormValues = {
  nom: string;
  adresse: string;
  description: string;
  telephone: string;
  email: string;
  villeId: string;
  quartierId: string;
};

export type ProviderEtablissementFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  etablissementId?: string;
  initialRow?: ProviderEtablissement | null;
  onSuccess: () => void;
  labels: Labels;
};

export function ProviderEtablissementFormModal({
  open,
  onClose,
  mode,
  etablissementId,
  initialRow,
  onSuccess,
  labels,
}: ProviderEtablissementFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [cities, setCities] = useState<CityListItem[]>([]);
  const [districts, setDistricts] = useState<DistrictListItem[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const isEdit = mode === "edit";
  const title = isEdit ? labels.formEditTitle : labels.formCreateTitle;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nom: "",
      adresse: "",
      description: "",
      telephone: "",
      email: "",
      villeId: "",
      quartierId: "",
    },
  });

  const villeId = watch("villeId");

  useEffect(() => {
    if (!open) return;
    setLoadingRefs(true);
    void fetchCities({ page: 1, limit: 300 })
      .then((res) => setCities(res.data))
      .catch(() => message.error(labels.loadError))
      .finally(() => setLoadingRefs(false));
  }, [open, labels.loadError]);

  useEffect(() => {
    if (!open || !villeId) {
      setDistricts([]);
      setValue("quartierId", "");
      return;
    }
    void fetchDistricts({ page: 1, limit: 300, cityId: villeId })
      .then((res) => setDistricts(res.data))
      .catch(() => setDistricts([]));
  }, [open, villeId, setValue]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialRow) {
      reset({
        nom: initialRow.nom,
        adresse: initialRow.adresse ?? "",
        description: initialRow.description ?? "",
        telephone: initialRow.telephone ?? "",
        email: initialRow.email ?? "",
        villeId: geoId(initialRow.ville),
        quartierId: geoId(initialRow.quartier),
      });
    }
    if (!isEdit) {
      reset({
        nom: "",
        adresse: "",
        description: "",
        telephone: "",
        email: "",
        villeId: "",
        quartierId: "",
      });
    }
  }, [open, isEdit, initialRow, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        nom: values.nom.trim(),
        adresse: values.adresse.trim() || undefined,
        description: values.description.trim() || undefined,
        telephone: values.telephone.trim() || undefined,
        email: values.email.trim() || undefined,
        ville: values.villeId || undefined,
        quartier: values.quartierId || undefined,
      };
      if (isEdit && etablissementId) {
        await updateProviderEtablissement(etablissementId, payload);
      } else {
        await createProviderEtablissement({ ...payload, isActive: true });
      }
      message.success("OK");
      onSuccess();
      onClose();
    } catch {
      message.error(labels.saveError);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={560}
    >
      <form id={FORM_ID} className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="pe-nom">{labels.formNom}</Label>
          <Input
            id="pe-nom"
            {...register("nom", { required: true })}
            aria-invalid={errors.nom ? "true" : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pe-adresse">{labels.formAdresse}</Label>
          <Input id="pe-adresse" {...register("adresse")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pe-desc">{labels.formDescription}</Label>
          <Textarea id="pe-desc" rows={3} {...register("description")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pe-tel">{labels.formTelephone}</Label>
            <Input id="pe-tel" {...register("telephone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pe-email">{labels.formEmail}</Label>
            <Input id="pe-email" type="email" {...register("email")} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pe-ville">{labels.formVille}</Label>
            <select
              id="pe-ville"
              className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              disabled={loadingRefs}
              {...register("villeId", {
                onChange: () => setValue("quartierId", ""),
              })}
            >
              <option value="">{labels.selectVille}</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pe-quartier">{labels.formQuartier}</Label>
            <select
              id="pe-quartier"
              className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              disabled={!villeId}
              {...register("quartierId")}
            >
              <option value="">{labels.selectQuartier}</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {labels.formCancel}
          </Button>
          <Button type="submit" disabled={submitting}>
            {labels.formSave}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
