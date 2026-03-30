"use client";

import { Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { LocationPicker } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiRequestError, matchBackendMessagesToFields } from "@/lib/api/api-request-error";
import { fetchCities, type CityListItem } from "@/lib/api/cities";
import { fetchDistricts, type DistrictListItem } from "@/lib/api/districts";
import {
  createProviderEtablissement,
  updateProviderEtablissement,
  type ProviderEtablissement,
} from "@/lib/api/provider-etablissements";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { validateAssignmentGeoStrings } from "@/lib/location/etablissement-service-location";
import { parseCoordField } from "@/lib/validation/coordinates";
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

function lineAdresse(e: ProviderEtablissement): string {
  return (e.adresse ?? e.address ?? "").trim();
}

const FORM_ID = "provider-etablissement-form";

type FormValues = {
  nom: string;
  adresse: string;
  latitude: string;
  longitude: string;
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
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nom: "",
      adresse: "",
      latitude: "",
      longitude: "",
      description: "",
      telephone: "",
      email: "",
      villeId: "",
      quartierId: "",
    },
  });

  useEffect(() => {
    register("adresse");
    register("latitude");
    register("longitude");
  }, [register]);

  const villeId = watch("villeId");
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

  const selectClass = useMemo(
    () =>
      cn(
        "flex min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
      ),
    [],
  );

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
      const lat = initialRow.latitude;
      const lng = initialRow.longitude;
      reset({
        nom: initialRow.nom,
        adresse: lineAdresse(initialRow),
        latitude: lat != null && !Number.isNaN(Number(lat)) ? String(lat) : "",
        longitude: lng != null && !Number.isNaN(Number(lng)) ? String(lng) : "",
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
        latitude: "",
        longitude: "",
        description: "",
        telephone: "",
        email: "",
        villeId: "",
        quartierId: "",
      });
    }
  }, [open, isEdit, initialRow, reset]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    clearErrors(["latitude", "longitude", "adresse"]);
    const geoErr = validateAssignmentGeoStrings(values.latitude, values.longitude, labels);
    if (geoErr) {
      if (geoErr.latitude) setError("latitude", { message: geoErr.latitude });
      if (geoErr.longitude) setError("longitude", { message: geoErr.longitude });
      return;
    }

    const lat = parseCoordField(values.latitude);
    const lng = parseCoordField(values.longitude);

    setSubmitting(true);
    try {
      const common = {
        nom: values.nom.trim(),
        description: values.description.trim() || undefined,
        telephone: values.telephone.trim() || undefined,
        email: values.email.trim() || undefined,
        adresse: values.adresse.trim() || undefined,
        ville: values.villeId.trim() || undefined,
        quartier: values.quartierId.trim() || undefined,
        ...(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : {}),
      };

      if (isEdit && etablissementId) {
        await updateProviderEtablissement(etablissementId, common);
      } else {
        await createProviderEtablissement({ ...common, isActive: true });
      }
      message.success(labels.formSave);
      onSuccess();
      onClose();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        const mapped = matchBackendMessagesToFields(e.messages);
        if (mapped.adresse) setError("adresse", { message: mapped.adresse });
        if (mapped.latitude) setError("latitude", { message: mapped.latitude });
        if (mapped.longitude) setError("longitude", { message: mapped.longitude });
      }
      message.error(e instanceof Error ? e.message : labels.saveError);
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
          <Button type="submit" form={FORM_ID} disabled={submitting || loadingRefs}>
            {labels.formSave}
          </Button>
        </div>
      }
      destroyOnClose
      width={720}
    >
      {loadingRefs ? (
        <p className="text-sm text-muted-foreground">{labels.loading}</p>
      ) : (
        <form
          id={FORM_ID}
          className="max-h-[75vh] space-y-4 overflow-y-auto pr-1"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="pe-nom">{labels.formNom}</Label>
            <Input
              id="pe-nom"
              {...register("nom", { required: true })}
              aria-invalid={errors.nom ? "true" : undefined}
            />
            {errors.nom ? <p className="text-xs text-destructive">Requis.</p> : null}
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

          <section className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{labels.mainLocationTitle}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{labels.mainLocationHelp}</p>
            </div>
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
          </section>

          <div className="grid gap-2">
            <Label htmlFor="pe-ville">{labels.formVille}</Label>
            <select id="pe-ville" className={selectClass} {...register("villeId")}>
              <option value="">{labels.selectVille}</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pe-quartier">{labels.formQuartier}</Label>
            <select
              id="pe-quartier"
              className={selectClass}
              {...register("quartierId")}
              disabled={!villeId}
            >
              <option value="">{labels.selectQuartier}</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.nom}
                </option>
              ))}
            </select>
            {!villeId ? <p className="text-xs text-muted-foreground">{labels.formQuartierNeedVille}</p> : null}
          </div>
        </form>
      )}
    </Modal>
  );
}
