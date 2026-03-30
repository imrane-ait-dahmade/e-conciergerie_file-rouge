"use client";

import { Modal, Switch, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { LocationPicker } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiRequestError, matchBackendMessagesToFields } from "@/lib/api/api-request-error";
import type { ProviderEtablissement } from "@/lib/api/provider-etablissements";
import {
  createProviderEstablishmentService,
  updateProviderEstablishmentService,
  type UpdateProviderEtablissementServicePayload,
} from "@/lib/api/provider-establishment-services";
import type { ServiceDoc } from "@/lib/types/catalog";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { EtablissementServiceAssignment } from "@/lib/types/etablissement-service";
import { refId } from "@/lib/types/etablissement-service";
import {
  hasSpecificGeo,
  lineAdresseService,
  validateAssignmentGeoStrings,
} from "@/lib/location/etablissement-service-location";
import { parseCoordField } from "@/lib/validation/coordinates";
import { cn } from "@/lib/utils";

type Labels = CommonDictionary["providerEstablishmentServices"];

const FORM_CREATE_ID = "provider-esc-create";
const FORM_EDIT_ID = "provider-esc-edit";

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

export function ProviderEstablishmentServiceCreateModal({
  open,
  onClose,
  labels,
  rows,
  etabs,
  catalog,
  initialEtabId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  rows: EtablissementServiceAssignment[];
  etabs: ProviderEtablissement[];
  catalog: ServiceDoc[];
  initialEtabId: string;
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
      etablissement: initialEtabId || "",
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
  }, [open, initialEtabId, reset]);

  useEffect(() => {
    setValue("service", "");
  }, [etabId, setValue]);

  const takenIds = useMemo(
    () => (etabId ? assignedServiceIdsForEtablissement(rows, etabId) : new Set<string>()),
    [etabId, rows],
  );

  const availableServices = useMemo(
    () => catalog.filter((s) => !takenIds.has(s._id)),
    [catalog, takenIds],
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
        await createProviderEstablishmentService({
          etablissement: values.etablissement,
          service: values.service,
          ...(prix !== undefined ? { prix } : {}),
          ...(commentaire !== "" ? { commentaire } : {}),
        });
      } else {
        await createProviderEstablishmentService({
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
        etablissement: initialEtabId || "",
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
      message.error(e instanceof Error ? e.message : labels.saveError);
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
          <Button
            type="submit"
            form={FORM_CREATE_ID}
            disabled={submitting || !etabId || availableServices.length === 0}
          >
            {labels.formSave}
          </Button>
        </div>
      }
      destroyOnClose
    >
      <form
        id={FORM_CREATE_ID}
        className="max-h-[75vh] space-y-4 overflow-y-auto pt-2 pr-1"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <Label>{labels.formEtablissement}</Label>
          <select
            className={cn(
              "flex h-11 min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
            )}
            {...register("etablissement", {
              onChange: () => setValue("service", ""),
            })}
          >
            <option value="">{labels.selectPlaceholder}</option>
            {etabs.map((e) => (
              <option key={e._id} value={e._id}>
                {e.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>{labels.formService}</Label>
          <select
            className={cn(
              "flex h-11 min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
            )}
            disabled={!etabId}
            {...register("service")}
          >
            <option value="">{labels.selectPlaceholder}</option>
            {availableServices.map((s) => (
              <option key={s._id} value={s._id}>
                {s.nom}
              </option>
            ))}
          </select>
          {etabId && availableServices.length === 0 ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">{labels.noServiceAvailable}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${FORM_CREATE_ID}-prix`}>{labels.formPrix}</Label>
          <Input
            id={`${FORM_CREATE_ID}-prix`}
            type="text"
            inputMode="decimal"
            placeholder={labels.prixPlaceholder}
            {...register("prix")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${FORM_CREATE_ID}-commentaire`}>{labels.formCommentaire}</Label>
          <Textarea
            id={`${FORM_CREATE_ID}-commentaire`}
            rows={3}
            placeholder={labels.commentairePlaceholder}
            {...register("commentaire")}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          <Label htmlFor={`${FORM_CREATE_ID}-specific`} className="font-medium">
            {labels.specificLocationToggle}
          </Label>
          <Controller
            name="useSpecificLocation"
            control={control}
            render={({ field }) => (
              <Switch
                id={`${FORM_CREATE_ID}-specific`}
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
                <Label htmlFor={`${FORM_CREATE_ID}-loc-label`}>{labels.formLocationLabel}</Label>
                <Input id={`${FORM_CREATE_ID}-loc-label`} {...register("location_label")} />
                {errors.location_label ? (
                  <p className="text-xs text-destructive">{errors.location_label.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${FORM_CREATE_ID}-loc-type`}>{labels.formLocationType}</Label>
                <Input id={`${FORM_CREATE_ID}-loc-type`} {...register("location_type")} />
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

export function ProviderEstablishmentServiceEditModal({
  open,
  onClose,
  labels,
  row,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  row: EtablissementServiceAssignment | null;
  onSuccess: () => void | Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const hadGeoInitially = useMemo(() => (row ? hasSpecificGeo(row) : false), [row]);

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
      const base: UpdateProviderEtablissementServicePayload = {
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
        await updateProviderEstablishmentService(row._id, base);
      } else {
        base.adresse = values.adresse.trim() !== "" ? values.adresse.trim() : "";
        if (lat !== null && lng !== null) {
          base.latitude = lat;
          base.longitude = lng;
        }
        base.location_label = values.location_label.trim() !== "" ? values.location_label.trim() : "";
        base.location_type = values.location_type.trim() !== "" ? values.location_type.trim() : "";
        await updateProviderEstablishmentService(row._id, base);
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
      message.error(e instanceof Error ? e.message : labels.saveError);
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
          <Button type="submit" form={FORM_EDIT_ID} disabled={submitting}>
            {labels.formSave}
          </Button>
        </div>
      }
      destroyOnClose
    >
      <form
        id={FORM_EDIT_ID}
        className="max-h-[75vh] space-y-4 overflow-y-auto pt-2 pr-1"
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="text-sm text-muted-foreground">{labels.editHint}</p>
        <div className="space-y-2">
          <Label htmlFor={`${FORM_EDIT_ID}-prix`}>{labels.formPrix}</Label>
          <Input
            id={`${FORM_EDIT_ID}-prix`}
            type="text"
            inputMode="decimal"
            placeholder={labels.prixPlaceholder}
            {...register("prix")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${FORM_EDIT_ID}-commentaire`}>{labels.formCommentaire}</Label>
          <Textarea
            id={`${FORM_EDIT_ID}-commentaire`}
            rows={4}
            placeholder={labels.commentairePlaceholder}
            {...register("commentaire")}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          <Label htmlFor={`${FORM_EDIT_ID}-specific`} className="font-medium">
            {labels.specificLocationToggle}
          </Label>
          <Controller
            name="useSpecificLocation"
            control={control}
            render={({ field }) => (
              <Switch
                id={`${FORM_EDIT_ID}-specific`}
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
                <Label htmlFor={`${FORM_EDIT_ID}-loc-label`}>{labels.formLocationLabel}</Label>
                <Input id={`${FORM_EDIT_ID}-loc-label`} {...register("location_label")} />
                {errors.location_label ? (
                  <p className="text-xs text-destructive">{errors.location_label.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${FORM_EDIT_ID}-loc-type`}>{labels.formLocationType}</Label>
                <Input id={`${FORM_EDIT_ID}-loc-type`} {...register("location_type")} />
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
