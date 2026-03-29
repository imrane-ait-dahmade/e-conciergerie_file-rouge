"use client";

import { Loader2, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchProviderEtablissements } from "@/lib/api/provider-etablissements";
import {
  fetchProviderEstablishmentServices,
} from "@/lib/api/provider-establishment-services";
import {
  deleteProviderMedia,
  fetchProviderMediaList,
  setProviderMediaPrimary,
  uploadProviderMediaBatch,
  type ProviderMedia,
} from "@/lib/api/provider-media";
import { ProviderMediaGallery } from "@/components/prestataire/provider-media-gallery";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { ProviderEtablissement } from "@/lib/api/provider-etablissements";
import type { EtablissementServiceAssignment } from "@/lib/types/etablissement-service";
import { cn } from "@/lib/utils";

type Labels = CommonDictionary["providerMedias"];

function etablissementNom(row: EtablissementServiceAssignment): string {
  const e = row.etablissement;
  if (typeof e === "string") return e;
  return e?.nom ?? "—";
}

function serviceNom(row: EtablissementServiceAssignment): string {
  const s = row.service;
  if (typeof s === "string") return s;
  return s?.nom ?? "—";
}

export function ProviderMediasSection({
  labels,
}: {
  labels: Labels;
  /** Réserve pour formatage dates / futur i18n côté client */
  locale?: string;
}) {
  const [target, setTarget] = useState<"etablissement" | "service">("etablissement");
  const [etablissements, setEtablissements] = useState<ProviderEtablissement[]>([]);
  const [assignments, setAssignments] = useState<EtablissementServiceAssignment[]>([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [refsError, setRefsError] = useState<string | null>(null);

  const [etablissementId, setEtablissementId] = useState("");
  const [etablissementServiceId, setEtablissementServiceId] = useState("");

  const [pickedFiles, setPickedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPrimary, setIsPrimary] = useState(false);

  const [mediaList, setMediaList] = useState<ProviderMedia[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingPrimaryId, setMarkingPrimaryId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{
    variant: "default" | "destructive";
    title: string;
    message?: string;
  } | null>(null);

  const parentReady = useMemo(() => {
    if (target === "etablissement") return Boolean(etablissementId);
    return Boolean(etablissementServiceId);
  }, [target, etablissementId, etablissementServiceId]);

  const loadRefs = useCallback(async () => {
    setRefsLoading(true);
    setRefsError(null);
    try {
      const [etabs, assigns] = await Promise.all([
        fetchProviderEtablissements(),
        fetchProviderEstablishmentServices(),
      ]);
      setEtablissements(etabs);
      setAssignments(assigns);
    } catch (e) {
      setRefsError(e instanceof Error ? e.message : labels.refsLoadError);
    } finally {
      setRefsLoading(false);
    }
  }, [labels.refsLoadError]);

  useEffect(() => {
    void loadRefs();
  }, [loadRefs]);

  useEffect(() => {
    const next = pickedFiles.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
    );
    setPreviewUrls(next);
    return () => {
      for (const u of next) {
        if (u) URL.revokeObjectURL(u);
      }
    };
  }, [pickedFiles]);

  const loadMediaList = useCallback(async () => {
    if (!parentReady) {
      setMediaList([]);
      return;
    }
    setListLoading(true);
    setListError(null);
    try {
      const data = await fetchProviderMediaList(
        target === "etablissement"
          ? { etablissementId }
          : { etablissementServiceId },
      );
      setMediaList(data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : labels.loadListError);
      setMediaList([]);
    } finally {
      setListLoading(false);
    }
  }, [parentReady, target, etablissementId, etablissementServiceId, labels.loadListError]);

  useEffect(() => {
    void loadMediaList();
  }, [loadMediaList]);

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setPickedFiles(list);
    setFeedback(null);
    e.target.value = "";
  }

  async function onUpload() {
    if (!parentReady || !pickedFiles.length) return;
    setUploading(true);
    setFeedback(null);
    try {
      const created = await uploadProviderMediaBatch(pickedFiles, {
        etablissementId: target === "etablissement" ? etablissementId : undefined,
        etablissementServiceId: target === "service" ? etablissementServiceId : undefined,
        isPrimary: isPrimary || undefined,
      });
      setPickedFiles([]);
      setIsPrimary(false);
      setFeedback({
        variant: "default",
        title: labels.successUpload,
        message:
          created.length > 1
            ? `${created.length} fichier(s) envoyé(s).`
            : undefined,
      });
      await loadMediaList();
    } catch (e) {
      setFeedback({
        variant: "destructive",
        title: labels.errorGeneric,
        message: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm(labels.deleteConfirm)) return;
    setDeletingId(id);
    setFeedback(null);
    try {
      await deleteProviderMedia(id);
      setFeedback({ variant: "default", title: labels.successDelete });
      await loadMediaList();
    } catch (e) {
      setFeedback({
        variant: "destructive",
        title: labels.errorGeneric,
        message: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function onMarkPrimary(id: string) {
    setMarkingPrimaryId(id);
    setFeedback(null);
    try {
      await setProviderMediaPrimary(id);
      setFeedback({ variant: "default", title: labels.successMarkPrimary });
      await loadMediaList();
    } catch (e) {
      setFeedback({
        variant: "destructive",
        title: labels.errorGeneric,
        message: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setMarkingPrimaryId(null);
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{labels.pageTitle}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {labels.pageDescription}
        </p>
      </header>

      {feedback ? (
        <Alert variant={feedback.variant === "destructive" ? "destructive" : "default"}>
          <AlertTitle>{feedback.title}</AlertTitle>
          {feedback.message ? <AlertDescription>{feedback.message}</AlertDescription> : null}
        </Alert>
      ) : null}

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>{labels.cardUploadTitle}</CardTitle>
          <CardDescription>{labels.cardUploadDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {refsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {labels.loadingRefs}
            </div>
          ) : refsError ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-destructive">
              {refsError}
              <Button type="button" variant="outline" size="sm" onClick={() => void loadRefs()}>
                {labels.retry}
              </Button>
            </div>
          ) : (
            <>
              <Tabs
                value={target}
                onValueChange={(v) => {
                  setTarget(v as "etablissement" | "service");
                  setFeedback(null);
                }}
                className="w-full"
              >
                <TabsList variant="line" className="mb-4 w-full min-w-0 justify-start sm:w-auto">
                  <TabsTrigger value="etablissement" className="px-4 py-2">
                    {labels.tabEstablishment}
                  </TabsTrigger>
                  <TabsTrigger value="service" className="px-4 py-2">
                    {labels.tabServiceLine}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="etablissement" className="mt-0 space-y-2">
                  <Label htmlFor="media-etab">{labels.selectEtabLabel}</Label>
                  <select
                    id="media-etab"
                    className={cn(
                      "flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    )}
                    value={etablissementId}
                    onChange={(e) => {
                      setEtablissementId(e.target.value);
                      setFeedback(null);
                    }}
                  >
                    <option value="">{labels.selectEtabPlaceholder}</option>
                    {etablissements.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.nom}
                      </option>
                    ))}
                  </select>
                </TabsContent>

                <TabsContent value="service" className="mt-0 space-y-2">
                  <Label htmlFor="media-es">{labels.selectServiceLabel}</Label>
                  <select
                    id="media-es"
                    className={cn(
                      "flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    )}
                    value={etablissementServiceId}
                    onChange={(e) => {
                      setEtablissementServiceId(e.target.value);
                      setFeedback(null);
                    }}
                  >
                    <option value="">{labels.selectServicePlaceholder}</option>
                    {assignments.map((a) => (
                      <option key={a._id} value={a._id}>
                        {etablissementNom(a)} — {serviceNom(a)}
                      </option>
                    ))}
                  </select>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="media-files">{labels.filesLabel}</Label>
                <Input
                  id="media-files"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled={!parentReady || uploading}
                  onChange={onFilesChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">{labels.filesHint}</p>
              </div>

              {pickedFiles.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {pickedFiles.map((f, i) => (
                    <div
                      key={`${f.name}-${i}`}
                      className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/40"
                    >
                      {previewUrls[i] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrls[i]}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <Video className="size-8 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  disabled={!parentReady || uploading}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                {labels.primaryCheckbox}
              </label>

              <Button
                type="button"
                disabled={!parentReady || !pickedFiles.length || uploading}
                onClick={() => void onUpload()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {labels.uploadingLabel}
                  </>
                ) : (
                  labels.uploadButton
                )}
              </Button>

              {!parentReady ? (
                <p className="text-sm text-muted-foreground">{labels.selectParentFirst}</p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>{labels.sectionLibrary}</CardTitle>
          <CardDescription>
            {parentReady ? labels.sectionLibraryHint : labels.selectParentFirst}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!parentReady ? null : listLoading ? (
            <div className="flex min-h-[120px] items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {labels.loadingList}
            </div>
          ) : listError ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-destructive">
              {listError}
              <Button type="button" variant="outline" size="sm" onClick={() => void loadMediaList()}>
                {labels.retry}
              </Button>
            </div>
          ) : mediaList.length === 0 ? (
            <p className="text-sm text-muted-foreground">{labels.emptyLibrary}</p>
          ) : (
            <ProviderMediaGallery
              items={mediaList}
              labels={{
                badgePrimary: labels.badgePrimary,
                videoBadge: labels.videoBadge,
                deleteButton: labels.deleteButton,
                markPrimary: labels.markPrimary,
              }}
              onDelete={(id) => void onDelete(id)}
              onMarkPrimary={(id) => void onMarkPrimary(id)}
              deletingId={deletingId}
              markingPrimaryId={markingPrimaryId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
