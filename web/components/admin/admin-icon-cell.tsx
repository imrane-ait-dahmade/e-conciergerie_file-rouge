"use client";

import { AdminIconPreview } from "@/components/admin/admin-icon-preview";

type AdminIconCellProps = {
  value?: string | null;
};

/**
 * Cellule tableau catalogue : URL → miniature ; clé → glyphe Lucide ; vide → tiret discret.
 * Aligné visuellement avec les aperçus des formulaires (`AdminIconPreview`).
 */
export function AdminIconCell({ value }: AdminIconCellProps) {
  const v = value?.trim() ?? "";
  if (!v) {
    return (
      <span className="inline-flex min-h-8 min-w-8 items-center justify-center text-muted-foreground">
        —
      </span>
    );
  }
  return (
    <div className="flex justify-center" title={v}>
      <AdminIconPreview value={v} size="sm" />
    </div>
  );
}
