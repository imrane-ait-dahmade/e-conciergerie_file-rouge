"use client";

import { message } from "antd";
import { Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { AdminIconPreview } from "@/components/admin/admin-icon-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadSingleFile } from "@/lib/api/uploads";
import { cn } from "@/lib/utils";

type Mode = "library" | "custom";

/** Libellés i18n (onglets, upload, aide) — fournis par la page via le dictionnaire. */
export type IconFieldI18n = {
  tabLibrary: string;
  tabCustom: string;
  none: string;
  upload: string;
  uploading: string;
  customHint: string;
  preview: string;
  unknownKeyHint: string;
};

export type IconFieldProps = {
  /** Préfixe stable pour `id` / accessibilité (ex. `admin-domaine-form-icon`). */
  id: string;
  /** Nom champ formulaire (optionnel, ex. pour tests). */
  name?: string;
  label: string;
  helperText: string;
  placeholder: string;
  error?: string;
  /** Clés proposées en bibliothèque (domain / service / caractéristique). */
  presets: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Pour React Hook Form (`field.onBlur`). */
  onBlur?: () => void;
  i18n: IconFieldI18n;
  disabled?: boolean;
};

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function matchesPreset(presets: readonly string[], v: string): boolean {
  const t = v.trim().toLowerCase();
  return presets.some((p) => p.toLowerCase() === t);
}

/**
 * Champ `icon` admin : bibliothèque (clés + preview Lucide) ou URL / upload MinIO.
 * Composant contrôlé — à utiliser avec `<Controller>` ou état local.
 */
export function IconField({
  id,
  name,
  label,
  helperText,
  placeholder,
  error,
  presets,
  value,
  onChange,
  onBlur,
  i18n,
  disabled = false,
}: IconFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlId = `${id}-url`;
  const fileId = useId();
  const [mode, setMode] = useState<Mode>(() => (isHttpUrl(value) ? "custom" : "library"));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isHttpUrl(value)) setMode("custom");
  }, [value]);

  const handleBlur = () => {
    onBlur?.();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || disabled) return;
    if (!f.type.startsWith("image/")) {
      message.error("Choisissez une image.");
      return;
    }
    setUploading(true);
    try {
      const r = await uploadSingleFile(f);
      onChange(r.url);
      setMode("custom");
      message.success("Image uploadée.");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Upload impossible.");
    } finally {
      setUploading(false);
    }
  };

  const showUnknownKey =
    mode === "library" &&
    Boolean(value.trim()) &&
    !matchesPreset(presets, value) &&
    !isHttpUrl(value);

  const off = disabled || uploading;

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium leading-none text-foreground">{label}</span>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "library" ? "default" : "outline"}
          size="sm"
          className="h-9"
          disabled={disabled}
          onClick={() => setMode("library")}
        >
          {i18n.tabLibrary}
        </Button>
        <Button
          type="button"
          variant={mode === "custom" ? "default" : "outline"}
          size="sm"
          className="h-9"
          disabled={disabled}
          onClick={() => setMode("custom")}
        >
          {i18n.tabCustom}
        </Button>
      </div>

      {mode === "library" ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            <button
              type="button"
              name={name}
              disabled={disabled}
              onClick={() => {
                onChange("");
                handleBlur();
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-colors",
                !value.trim()
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border hover:bg-muted/60",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed text-[10px] text-muted-foreground">
                ∅
              </span>
              <span className="max-w-full truncate text-[10px] text-muted-foreground">
                {i18n.none}
              </span>
            </button>
            {presets.map((key) => {
              const selected =
                value.trim().toLowerCase() === key.toLowerCase() && !isHttpUrl(value);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(key);
                    handleBlur();
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                    selected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border hover:bg-muted/60",
                    disabled && "pointer-events-none opacity-50",
                  )}
                >
                  <AdminIconPreview value={key} size="sm" />
                  <span className="max-w-full truncate text-[10px] text-muted-foreground" title={key}>
                    {key}
                  </span>
                </button>
              );
            })}
          </div>

          {value.trim() && !isHttpUrl(value) ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <span className="text-xs text-muted-foreground">{i18n.preview}</span>
              <AdminIconPreview value={value} size="sm" />
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{value.trim()}</code>
            </div>
          ) : null}

          {showUnknownKey ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">{i18n.unknownKeyHint}</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor={urlId} className="text-xs font-normal text-muted-foreground">
                URL
              </Label>
              <Input
                id={urlId}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={handleBlur}
                placeholder={placeholder}
                autoComplete="off"
                disabled={disabled}
                aria-invalid={error ? "true" : "false"}
              />
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 sm:pt-5">
              <input
                ref={fileInputRef}
                id={fileId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFile}
                disabled={off}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 gap-1.5"
                disabled={off}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4 shrink-0" aria-hidden />
                {uploading ? i18n.uploading : i18n.upload}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{i18n.customHint}</p>
          {value.trim() ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{i18n.preview}</span>
              <AdminIconPreview value={value} />
            </div>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-muted-foreground">{helperText}</p>
    </div>
  );
}
