"use client";

import { getLucideForAdminIconKey } from "@/lib/admin-icon-lucide-map";
import { cn } from "@/lib/utils";

type AdminIconPreviewProps = {
  value: string;
  size?: "sm" | "md";
  className?: string;
};

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

/**
 * Aperçu : URL → miniature ; sinon clé → glyphe Lucide (mapping métier).
 */
export function AdminIconPreview({ value, size = "md", className }: AdminIconPreviewProps) {
  const v = value.trim();
  if (!v) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-dashed border-border text-muted-foreground",
          size === "sm" ? "size-8 text-[10px]" : "size-10 text-xs",
          className,
        )}
      >
        —
      </span>
    );
  }
  if (isHttpUrl(v)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL MinIO / externe
      <img
        src={v}
        alt=""
        className={cn(
          "rounded-md border border-border object-cover",
          size === "sm" ? "size-8" : "size-10",
          className,
        )}
      />
    );
  }
  const Icon = getLucideForAdminIconKey(v);
  const dim = size === "sm" ? "size-8" : "size-10";
  const iconSize = size === "sm" ? 16 : 20;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-border bg-muted/50 text-foreground",
        dim,
        className,
      )}
    >
      <Icon className="shrink-0" size={iconSize} aria-hidden />
    </span>
  );
}
