"use client";

import { Modal, Select, Spin, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCity, updateCity } from "@/lib/api/cities";
import { fetchCountries, type CountryListItem } from "@/lib/api/countries";
import { uploadGeoMedia } from "@/lib/api/provider-media";
import { extractDocumentId } from "@/lib/extract-document-id";

const FORM_ID = "city-form";

export type CityFormInitialData = {
  id: string;
  name: string;
  countryId: string;
};

export type CityFormModalProps = {
  open: boolean;
  onClose: () => void;
  initialData?: CityFormInitialData;
  onSuccess: () => void;
};

type FormValues = {
  name: string;
  countryId: string;
};

function countryLabel(c: CountryListItem): string {
  if (c.code) return `${c.nom} (${c.code})`;
  return c.nom;
}

export function CityFormModal({ open, onClose, initialData, onSuccess }: CityFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countries, setCountries] = useState<CountryListItem[]>([]);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  const isEdit = Boolean(initialData?.id);

  const title = useMemo(
    () => (isEdit ? "Modifier la ville" : "Ajouter une ville"),
    [isEdit],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", countryId: "" },
  });

  const loadCountries = useCallback(async () => {
    setCountriesLoading(true);
    setCountriesError(null);
    try {
      const res = await fetchCountries({ page: 1, limit: 100 });
      setCountries(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger les pays.";
      setCountriesError(msg);
      message.error(msg);
      setCountries([]);
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadCountries();
  }, [open, loadCountries]);

  useEffect(() => {
    if (!open) return;
    reset({
      name: initialData?.name ?? "",
      countryId: initialData?.countryId ?? "",
    });
    setCoverFile(null);
  }, [open, initialData?.id, initialData?.name, initialData?.countryId, reset]);

  const selectOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c._id,
        label: countryLabel(c),
      })),
    [countries],
  );

  const handleClose = () => {
    if (submitting || countriesLoading) return;
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    const nom = values.name.trim();
    const pays = values.countryId;

    setSubmitting(true);
    try {
      let cityId: string | null = null;
      if (isEdit && initialData?.id) {
        await updateCity(initialData.id, { nom, pays });
        cityId = initialData.id;
        message.success("Ville mise à jour.");
      } else {
        const created = await createCity({ nom, pays });
        cityId = extractDocumentId(created);
        message.success("Ville créée.");
        if (!cityId) {
          message.warning(
            "Réponse sans identifiant : impossible d’envoyer l’image automatiquement.",
          );
        }
      }

      if (coverFile && cityId) {
        try {
          await uploadGeoMedia(coverFile, {
            entityType: "city",
            entityId: cityId,
            isPrimary: true,
          });
          message.success("Image de la ville enregistrée.");
        } catch (e) {
          message.warning(
            e instanceof Error
              ? `Image : ${e.message}`
              : "L’image n’a pas pu être enregistrée.",
          );
        }
      }

      onSuccess();
      onClose();
      reset({ name: "", countryId: "" });
      setCoverFile(null);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const formDisabled = countriesLoading || Boolean(countriesError);

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
      width={480}
    >
      <div className="py-1">
        {countriesLoading ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 py-6">
            <Spin size="large" />
            <p className="text-sm text-muted-foreground">Chargement des pays…</p>
          </div>
        ) : countriesError ? (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <span>{countriesError}</span>
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => void loadCountries()}>
              Réessayer
            </Button>
          </div>
        ) : null}

        {!countriesLoading && !countriesError ? (
          <form id={FORM_ID} className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="city-name">
                Nom de la ville <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city-name"
                autoComplete="off"
                placeholder="Ex. Casablanca"
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
              <Label htmlFor="city-country">
                Pays <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="countryId"
                control={control}
                rules={{ required: "Sélectionnez un pays" }}
                render={({ field }) => (
                  <Select
                    id="city-country"
                    className="w-full"
                    placeholder="Choisir un pays"
                    options={selectOptions}
                    value={field.value || undefined}
                    onChange={(v) => field.onChange(v ?? "")}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    size="large"
                    status={errors.countryId ? "error" : undefined}
                    getPopupContainer={(n) => n.parentElement ?? document.body}
                  />
                )}
              />
              {errors.countryId ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.countryId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city-cover">Image de la ville (optionnel)</Label>
              <Input
                id="city-cover"
                type="file"
                accept="image/*"
                disabled={formDisabled || submitting}
                className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Envoyée après l’enregistrement de la ville, comme image principale.
              </p>
              {coverFile ? (
                <p className="truncate text-xs text-muted-foreground" title={coverFile.name}>
                  Sélection : {coverFile.name}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </div>
    </Modal>
  );
}
