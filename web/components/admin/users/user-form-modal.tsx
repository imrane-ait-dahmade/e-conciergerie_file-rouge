"use client";

import { Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminUser,
  fetchAdminUser,
  updateAdminUser,
  type AdminUser,
} from "@/lib/api/users-admin";
import type { CommonDictionary } from "@/lib/get-dictionary";

const FORM_ID = "admin-user-form";

type Labels = CommonDictionary["adminUsers"];

export type UserFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  /** En édition : id utilisateur */
  userId?: string;
  /** Ligne liste pour préremplissage rapide avant chargement détail */
  initialUser?: AdminUser | null;
  onSuccess: () => void;
  labels: Labels;
};

type FormValues = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: "admin" | "prestataire" | "client";
  telephone: string;
  adresse: string;
};

export function UserFormModal({
  open,
  onClose,
  mode,
  userId,
  initialUser,
  onSuccess,
  labels,
}: UserFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isEdit = mode === "edit";

  const title = isEdit ? labels.formEditTitle : labels.formCreateTitle;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      role: "client",
      telephone: "",
      adresse: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (isEdit && userId) {
      setLoadingDetail(true);
      void fetchAdminUser(userId)
        .then((u) => {
          reset({
            nom: u.nom,
            prenom: u.prenom,
            email: u.email,
            password: "",
            role: (u.role?.name as FormValues["role"]) ?? "client",
            telephone: u.telephone ?? "",
            adresse: u.adresse ?? "",
          });
        })
        .catch(() => {
          if (initialUser) {
            reset({
              nom: initialUser.nom,
              prenom: initialUser.prenom,
              email: initialUser.email,
              password: "",
              role: (initialUser.role?.name as FormValues["role"]) ?? "client",
              telephone: initialUser.telephone ?? "",
              adresse: initialUser.adresse ?? "",
            });
          }
          message.warning("Détail partiel depuis le tableau.");
        })
        .finally(() => setLoadingDetail(false));
    } else if (!isEdit) {
      reset({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        role: "client",
        telephone: "",
        adresse: "",
      });
    }
  }, [open, isEdit, userId, initialUser, reset]);

  const handleClose = () => {
    if (submitting || loadingDetail) return;
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    const nom = values.nom.trim();
    const prenom = values.prenom.trim();
    const email = values.email.trim().toLowerCase();
    const role = values.role;

    setSubmitting(true);
    try {
      if (isEdit && userId) {
        const payload: Parameters<typeof updateAdminUser>[1] = {
          nom,
          prenom,
          email,
          role,
          telephone: values.telephone.trim() || undefined,
          adresse: values.adresse.trim() || undefined,
        };
        const pwd = values.password.trim();
        if (pwd !== "") payload.password = pwd;
        await updateAdminUser(userId, payload);
        message.success("Utilisateur mis à jour.");
      } else {
        const pwd = values.password.trim();
        if (pwd.length < 8) {
          message.error("Mot de passe trop court (règles du serveur : 8 caractères minimum, complexité).");
          setSubmitting(false);
          return;
        }
        await createAdminUser({
          nom,
          prenom,
          email,
          password: pwd,
          role,
          telephone: values.telephone.trim() || undefined,
          adresse: values.adresse.trim() || undefined,
        });
        message.success("Utilisateur créé.");
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

  const selectClass =
    "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

  const roleOptions = useMemo(
    () =>
      [
        { value: "client" as const, label: labels.roleClient },
        { value: "prestataire" as const, label: labels.rolePrestataire },
        { value: "admin" as const, label: labels.roleAdmin },
      ] as const,
    [labels.roleAdmin, labels.roleClient, labels.rolePrestataire],
  );

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
      width={520}
      destroyOnClose
    >
      {loadingDetail ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <form id={FORM_ID} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="user-nom">{labels.formNom}</Label>
            <Input id="user-nom" {...register("nom", { required: true, minLength: 2 })} />
            {errors.nom ? <p className="text-xs text-destructive">Requis (min. 2 caractères).</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-prenom">{labels.formPrenom}</Label>
            <Input id="user-prenom" {...register("prenom", { required: true, minLength: 2 })} />
            {errors.prenom ? <p className="text-xs text-destructive">Requis.</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-email">{labels.formEmail}</Label>
            <Input id="user-email" type="email" {...register("email", { required: true })} />
            {errors.email ? <p className="text-xs text-destructive">Email requis.</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-password">{labels.formPassword}</Label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              {...register("password", { required: !isEdit })}
            />
            {isEdit ? (
              <p className="text-xs text-muted-foreground">{labels.formPasswordEditHint}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{labels.formPasswordRules}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-role">{labels.formRole}</Label>
            <select id="user-role" className={selectClass} {...register("role", { required: true })}>
              {roleOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-tel">{labels.formTelephone}</Label>
            <Input id="user-tel" {...register("telephone")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-adr">{labels.formAdresse}</Label>
            <Input id="user-adr" {...register("adresse")} />
          </div>
        </form>
      )}
    </Modal>
  );
}
