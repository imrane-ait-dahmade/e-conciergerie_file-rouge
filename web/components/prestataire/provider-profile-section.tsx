"use client";

import { message } from "antd";
import { User } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchUserProfile, updateUserProfile } from "@/lib/api/user-profile";
import { getAccessToken } from "@/lib/auth-storage";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

type Labels = CommonDictionary["providerProfile"];

type FormValues = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
};

export function ProviderProfileSection({
  locale,
  labels,
}: {
  locale: string;
  labels: Labels;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [roleLabel, setRoleLabel] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
    },
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsLogin(false);
    if (!getAccessToken()) {
      setNeedsLogin(true);
      setError(labels.loginPrompt);
      setLoading(false);
      return;
    }
    try {
      const profile = await fetchUserProfile();
      form.reset({
        nom: profile.nom ?? "",
        prenom: profile.prenom ?? "",
        email: profile.email ?? "",
        telephone: profile.telephone ?? "",
        adresse: profile.adresse ?? "",
      });
      setRoleLabel(profile.role?.label ?? profile.role?.name ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.loadError);
    } finally {
      setLoading(false);
    }
  }, [form, labels.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(values: FormValues) {
    try {
      await updateUserProfile({
        nom: values.nom.trim(),
        prenom: values.prenom.trim(),
        email: values.email.trim(),
        telephone: values.telephone.trim() || undefined,
        adresse: values.adresse.trim() || undefined,
      });
      message.success(labels.saveSuccess);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : labels.saveError;
      message.error(msg);
    }
  }

  const loginHref = `/${locale}/login`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <User className="size-7 text-primary" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{labels.pageTitle}</h1>
        </div>
        <p className="text-sm text-muted-foreground md:text-base">{labels.pageDescription}</p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-lg">{labels.cardTitle}</CardTitle>
          <CardDescription>{labels.cardDescription}</CardDescription>
          {roleLabel ? (
            <div className="pt-2">
              <span className="text-xs font-medium text-muted-foreground">{labels.roleLabel}: </span>
              <Badge variant="secondary" className="font-normal">
                {roleLabel}
              </Badge>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">{labels.loading}</p>
          ) : error ? (
            <div className="space-y-4">
              <p
                className={cn(
                  "text-sm",
                  needsLogin ? "text-muted-foreground" : "text-destructive",
                )}
              >
                {error}
              </p>
              <p>
                <Link href={loginHref} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  {labels.goToLogin}
                </Link>
              </p>
              {!needsLogin ? (
                <Button type="button" variant="outline" onClick={() => void load()}>
                  {labels.retry}
                </Button>
              ) : null}
            </div>
          ) : (
            <form className={cn("space-y-5")} onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prenom">{labels.fieldPrenom}</Label>
                  <Input id="prenom" autoComplete="given-name" {...form.register("prenom", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">{labels.fieldNom}</Label>
                  <Input id="nom" autoComplete="family-name" {...form.register("nom", { required: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{labels.fieldEmail}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...form.register("email", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">{labels.fieldTelephone}</Label>
                <Input
                  id="telephone"
                  type="tel"
                  autoComplete="tel"
                  {...form.register("telephone")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">{labels.fieldAdresse}</Label>
                <Textarea id="adresse" rows={3} className="resize-y" {...form.register("adresse")} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? labels.savingButton : labels.saveButton}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
