"use client";

import { Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCities, type CityListItem } from "@/lib/api/cities";
import { fetchDistricts, type DistrictListItem } from "@/lib/api/districts";
import {
  createAdminEtablissement,
  fetchAdminEtablissement,
  patchAdminEtablissementStatus,
  updateAdminEtablissement,
  type AdminEtablissement,
} from "@/lib/api/etablissements-admin";
import { fetchAdminUsers, type AdminUser } from "@/lib/api/users-admin";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

const FORM_ID = "admin-etablissement-form";

type Labels = CommonDictionary["adminEtablissements"];

function geoId(ref: unknown): string {
  if (!ref || typeof ref !== "object") return "";
  if ("_id" in ref && ref._id != null) return String(ref._id);
  return "";
}

export type EtablissementFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  etablissementId?: string;
  initialRow?: AdminEtablissement | null;
  onSuccess: () => void;
  labels: Labels;
};

type FormValues = {
  nom: string;
  prestataireId: string;
  description: string;
  telephone: string;
  email: string;
  adresse: string;
  villeId: string;
  quartierId: string;
  isActive: boolean;
};

export function EtablissementFormModal({
  open,
  onClose,
  mode,
  etablissementId,
  initialRow,
  onSuccess,
  labels,
}: EtablissementFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [prestataires, setPrestataires] = useState<AdminUser[]>([]);
  const [cities, setCities] = useState<CityListItem[]>([]);
  const [districts, setDistricts] = useState<DistrictListItem[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  /** Valeur `isActive` au chargement (le PATCH métier ne gère pas le statut). */
  const [loadedIsActive, setLoadedIsActive] = useState(true);

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
      prestataireId: "",
      description: "",
      telephone: "",
      email: "",
      adresse: "",
      villeId: "",
      quartierId: "",
      isActive: true,
    },
  });

  const villeId = watch("villeId");

  useEffect(() => {
    if (!open) return;
    setLoadingRefs(true);
    void Promise.all([
      fetchAdminUsers({ page: 1, limit: 100 }).then((res) =>
        setPrestataires(res.data.filter((u) => u.role?.name === "prestataire")),
      ),
      fetchCities({ page: 1, limit: 300 }).then((res) => setCities(res.data)),
    ])
      .catch(() => message.error(labels.loadError))
      .finally(() => setLoadingRefs(false));
  }, [open]);

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

    if (isEdit && etablissementId) {
      setLoadingDetail(true);
      void fetchAdminEtablissement(etablissementId)
        .then((e) => {
          setLoadedIsActive(e.isActive);
          reset({
            nom: e.nom,
            prestataireId: geoId(e.prestataire),
            description: e.description ?? "",
            telephone: e.telephone ?? "",
            email: e.email ?? "",
            adresse: e.adresse ?? "",
            villeId: geoId(e.ville),
            quartierId: geoId(e.quartier),
            isActive: e.isActive,
          });
        })
        .catch(() => {
          if (initialRow) {
            setLoadedIsActive(initialRow.isActive);
            reset({
              nom: initialRow.nom,
              prestataireId: geoId(initialRow.prestataire),
              description: initialRow.description ?? "",
              telephone: initialRow.telephone ?? "",
              email: initialRow.email ?? "",
              adresse: initialRow.adresse ?? "",
              villeId: geoId(initialRow.ville),
              quartierId: geoId(initialRow.quartier),
              isActive: initialRow.isActive,
            });
          }
          message.warning(labels.loadError);
        })
        .finally(() => setLoadingDetail(false));
    } else if (!isEdit) {
      setLoadedIsActive(true);
      reset({
        nom: "",
        prestataireId: "",
        description: "",
        telephone: "",
        email: "",
        adresse: "",
        villeId: "",
        quartierId: "",
        isActive: true,
      });
    }
  }, [open, isEdit, etablissementId, initialRow, reset]);

  const handleClose = () => {
    if (submitting || loadingDetail) return;
    onClose();
  };

  const selectClass = useMemo(
    () =>
      cn(
        "flex min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
      ),
    [],
  );

  const onSubmit = async (values: FormValues) => {
    const nom = values.nom.trim();
    const prestataire = values.prestataireId.trim();
    if (!prestataire) {
      message.error(labels.formPrestataire);
      return;
    }

    setSubmitting(true);
    try {
      const common = {
        nom,
        prestataire,
        description: values.description.trim() || undefined,
        telephone: values.telephone.trim() || undefined,
        email: values.email.trim() || undefined,
        adresse: values.adresse.trim() || undefined,
        ville: values.villeId.trim() || undefined,
        quartier: values.quartierId.trim() || undefined,
      };

      if (isEdit && etablissementId) {
        await updateAdminEtablissement(etablissementId, {
          ...common,
        });
        if (values.isActive !== loadedIsActive) {
          await patchAdminEtablissementStatus(etablissementId, values.isActive);
        }
        message.success(labels.formSave);
      } else {
        await createAdminEtablissement({
          ...common,
          isActive: values.isActive,
        });
        message.success(labels.formSave);
      }
      onSuccess();
      onClose();
      reset();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Erreur.");
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
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting || loadingDetail}>
            {labels.formCancel}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitting || loadingDetail}>
            {labels.formSave}
          </Button>
        </div>
      }
      width={560}
      destroyOnClose
    >
      {loadingDetail || loadingRefs ? (
        <p className="text-sm text-muted-foreground">{labels.loading}</p>
      ) : (
        <form id={FORM_ID} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="etab-nom">{labels.formNom}</Label>
            <Input id="etab-nom" {...register("nom", { required: true, minLength: 1 })} />
            {errors.nom ? <p className="text-xs text-destructive">Requis.</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="etab-presta">{labels.formPrestataire}</Label>
            <select id="etab-presta" className={selectClass} {...register("prestataireId", { required: true })}>
              <option value="">{labels.selectPlaceholder}</option>
              {prestataires.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom} — {p.email}
                </option>
              ))}
            </select>
            {prestataires.length === 0 ? (
              <p className="text-xs text-amber-600">{labels.noPrestataireAccounts}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="etab-desc">{labels.formDescription}</Label>
            <textarea
              id="etab-desc"
              rows={3}
              className={cn(
                selectClass,
                "min-h-[5rem] resize-y py-2 font-sans",
              )}
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="etab-tel">{labels.formTelephone}</Label>
              <Input id="etab-tel" {...register("telephone")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="etab-email">{labels.formEmail}</Label>
              <Input id="etab-email" type="email" {...register("email")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="etab-adr">{labels.formAdresse}</Label>
            <Input id="etab-adr" {...register("adresse")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="etab-ville">{labels.formVille}</Label>
            <select id="etab-ville" className={selectClass} {...register("villeId")}>
              <option value="">{labels.selectPlaceholder}</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="etab-quartier">{labels.formQuartier}</Label>
            <select id="etab-quartier" className={selectClass} {...register("quartierId")} disabled={!villeId}>
              <option value="">{labels.selectPlaceholder}</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.nom}
                </option>
              ))}
            </select>
            {!villeId ? <p className="text-xs text-muted-foreground">{labels.formQuartierNeedVille}</p> : null}
          </div>

          <div className="flex items-center gap-3">
            <input id="etab-active" type="checkbox" className="size-4 rounded border-input" {...register("isActive")} />
            <Label htmlFor="etab-active" className="font-normal">
              {labels.formIsActive}
            </Label>
          </div>
        </form>
      )}
    </Modal>
  );
}
