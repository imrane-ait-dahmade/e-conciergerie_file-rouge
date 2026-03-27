"use client";

import { Modal, Select, Spin, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCities, type CityListItem } from "@/lib/api/cities";
import { createDistrict, updateDistrict } from "@/lib/api/districts";

const FORM_ID = "district-form";

export type DistrictFormInitialData = {
  id: string;
  name: string;
  cityId: string;
};

export type DistrictFormModalProps = {
  open: boolean;
  onClose: () => void;
  initialData?: DistrictFormInitialData;
  /** Appelé après création / mise à jour réussie (rafraîchir la liste, etc.). */
  onSuccess: () => void;
};

type FormValues = {
  name: string;
  cityId: string;
};

function cityLabel(c: CityListItem): string {
  const pays = c.pays;
  if (pays && typeof pays === "object" && "nom" in pays && typeof pays.nom === "string") {
    const suffix = pays.code ? ` (${pays.code})` : "";
    return `${c.nom} — ${pays.nom}${suffix}`;
  }
  return c.nom;
}

export function DistrictFormModal({ open, onClose, initialData, onSuccess }: DistrictFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [cities, setCities] = useState<CityListItem[]>([]);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const isEdit = Boolean(initialData?.id);

  const title = useMemo(
    () => (isEdit ? "Modifier le quartier" : "Ajouter un quartier"),
    [isEdit],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", cityId: "" },
  });

  const loadCities = useCallback(async () => {
    setCitiesLoading(true);
    setCitiesError(null);
    try {
      const res = await fetchCities({ page: 1, limit: 100 });
      setCities(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger les villes.";
      setCitiesError(msg);
      message.error(msg);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadCities();
  }, [open, loadCities]);

  useEffect(() => {
    if (!open) return;
    reset({
      name: initialData?.name ?? "",
      cityId: initialData?.cityId ?? "",
    });
  }, [open, initialData?.id, initialData?.name, initialData?.cityId, reset]);

  const selectOptions = useMemo(
    () =>
      cities.map((c) => ({
        value: c._id,
        label: cityLabel(c),
      })),
    [cities],
  );

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    const nom = values.name.trim();
    const ville = values.cityId;

    setSubmitting(true);
    try {
      if (isEdit && initialData?.id) {
        await updateDistrict(initialData.id, { nom, ville });
        message.success("Quartier mis à jour.");
      } else {
        await createDistrict({ nom, ville });
        message.success("Quartier créé.");
      }
      onSuccess();
      onClose();
      reset({ name: "", cityId: "" });
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const formDisabled = citiesLoading || Boolean(citiesError);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      footer={
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitting || formDisabled}>
            {submitting ? "En cours…" : "Enregistrer"}
          </Button>
        </div>
      }
      destroyOnClose
      width={520}
    >
      <div className="py-1">
        {citiesLoading ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 py-6">
            <Spin size="large" />
            <p className="text-sm text-muted-foreground">Chargement des villes…</p>
          </div>
        ) : citiesError ? (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <span>{citiesError}</span>
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => void loadCities()}>
              Réessayer
            </Button>
          </div>
        ) : null}

        {!citiesLoading && !citiesError ? (
          <form id={FORM_ID} className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="district-name">
                Nom du quartier <span className="text-destructive">*</span>
              </Label>
              <Input
                id="district-name"
                autoComplete="off"
                placeholder="Ex. Maarif"
                aria-invalid={errors.name ? true : undefined}
                disabled={formDisabled}
                {...register("name", {
                  required: "Le nom est obligatoire",
                  maxLength: { value: 200, message: "Maximum 200 caractères" },
                })}
              />
              {errors.name ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district-city">
                Ville <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="cityId"
                control={control}
                rules={{ required: "Sélectionnez une ville" }}
                render={({ field }) => (
                  <Select
                    id="district-city"
                    className="w-full"
                    placeholder="Choisir une ville"
                    options={selectOptions}
                    value={field.value || undefined}
                    onChange={(v) => field.onChange(v ?? "")}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    size="large"
                    status={errors.cityId ? "error" : undefined}
                    getPopupContainer={(n) => n.parentElement ?? document.body}
                  />
                )}
              />
              {errors.cityId ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.cityId.message}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </div>
    </Modal>
  );
}
