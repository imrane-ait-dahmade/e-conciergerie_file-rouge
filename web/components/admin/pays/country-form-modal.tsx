"use client";

import { Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadGeoMedia } from "@/lib/api/provider-media";
import { createCountry, updateCountry } from "@/lib/api/countries";
import { extractDocumentId } from "@/lib/extract-document-id";

const FORM_ID = "country-form";

export type CountryFormInitialData = {
  id: string;
  name: string;
  code?: string;
};

export type CountryFormModalProps = {
  open: boolean;
  onClose: () => void;
  /** Si défini avec `id` → édition (PATCH), sinon création (POST). */
  initialData?: CountryFormInitialData;
  onSuccess: () => void;
};

type FormValues = {
  name: string;
  code: string;
};

export function CountryFormModal({ open, onClose, initialData, onSuccess }: CountryFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [flagFile, setFlagFile] = useState<File | null>(null);

  const isEdit = Boolean(initialData?.id);

  const title = useMemo(
    () => (isEdit ? "Modifier le pays" : "Ajouter un pays"),
    [isEdit],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", code: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: initialData?.name ?? "",
      code: initialData?.code ?? "",
    });
    setFlagFile(null);
  }, [open, initialData?.id, initialData?.name, initialData?.code, reset]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    const nom = values.name.trim();
    const codeRaw = values.code.trim();
    const payload = {
      nom,
      ...(codeRaw !== "" ? { code: codeRaw } : {}),
    };

    setSubmitting(true);
    try {
      let countryId: string | null = null;
      if (isEdit && initialData?.id) {
        await updateCountry(initialData.id, payload);
        countryId = initialData.id;
        message.success("Pays mis à jour.");
      } else {
        const created = await createCountry(payload);
        countryId = extractDocumentId(created);
        message.success("Pays créé.");
        if (!countryId) {
          message.warning(
            "Réponse sans identifiant : impossible d’envoyer le drapeau automatiquement.",
          );
        }
      }

      if (flagFile && countryId) {
        try {
          await uploadGeoMedia(flagFile, {
            entityType: "country",
            entityId: countryId,
            isPrimary: true,
          });
          message.success("Drapeau enregistré.");
        } catch (e) {
          message.warning(
            e instanceof Error
              ? `Drapeau : ${e.message}`
              : "Le drapeau n’a pas pu être enregistré.",
          );
        }
      }

      onSuccess();
      onClose();
      reset({ name: "", code: "" });
      setFlagFile(null);
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
            Annuler
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitting}>
            {submitting ? "En cours…" : "Enregistrer"}
          </Button>
        </div>
      }
      destroyOnClose
      width={480}
    >
      <form id={FORM_ID} className="flex flex-col gap-5 py-1" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="country-name">
            Nom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="country-name"
            autoComplete="off"
            placeholder="Ex. Maroc"
            aria-invalid={errors.name ? true : undefined}
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
          <Label htmlFor="country-code">Code ISO (optionnel)</Label>
          <Input
            id="country-code"
            autoComplete="off"
            placeholder="Ex. MA"
            maxLength={10}
            aria-invalid={errors.code ? true : undefined}
            {...register("code", {
              maxLength: { value: 10, message: "Maximum 10 caractères" },
            })}
          />
          {errors.code ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.code.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country-flag">Drapeau (image, optionnel)</Label>
          <Input
            id="country-flag"
            type="file"
            accept="image/*"
            disabled={submitting}
            className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
            onChange={(e) => setFlagFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            Envoyé après l’enregistrement du pays, comme image principale (drapeau).
          </p>
          {flagFile ? (
            <p className="truncate text-xs text-muted-foreground" title={flagFile.name}>
              Sélection : {flagFile.name}
            </p>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
