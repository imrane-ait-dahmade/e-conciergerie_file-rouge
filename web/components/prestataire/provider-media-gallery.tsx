"use client";

import { Loader2, Star, Trash2, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProviderMedia } from "@/lib/api/provider-media";
import { cn } from "@/lib/utils";

export type ProviderMediaGalleryLabels = {
  badgePrimary: string;
  videoBadge: string;
  deleteButton: string;
  markPrimary: string;
};

type ProviderMediaGalleryProps = {
  items: ProviderMedia[];
  labels: ProviderMediaGalleryLabels;
  onDelete: (id: string) => void;
  onMarkPrimary?: (id: string) => void;
  deletingId?: string | null;
  markingPrimaryId?: string | null;
  className?: string;
};

/**
 * Grille responsive de médias (images + vidéos) pour l’espace prestataire.
 */
export function ProviderMediaGallery({
  items,
  labels,
  onDelete,
  onMarkPrimary,
  deletingId,
  markingPrimaryId,
  className,
}: ProviderMediaGalleryProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {items.map((m) => (
        <li
          key={m._id}
          className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-[4/3] bg-muted/60">
            {m.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.url}
                alt={m.originalFilename ?? ""}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full flex-col bg-black/90">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-2 py-1.5 text-xs text-white/85">
                  <Video className="size-3.5 shrink-0 opacity-90" aria-hidden />
                  {labels.videoBadge}
                </div>
                <div className="relative min-h-0 flex-1 p-1">
                  <video
                    src={m.url}
                    controls
                    className="size-full max-h-[220px] rounded-md object-contain"
                    preload="metadata"
                  />
                </div>
              </div>
            )}
            {m.isPrimary ? (
              <Badge
                className="pointer-events-none absolute left-2 top-2 shadow-sm"
                variant="secondary"
              >
                {labels.badgePrimary}
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-2 border-t border-border/50 p-3">
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {m.originalFilename ?? m._id}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2">
              {onMarkPrimary && m.type === "image" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[7rem] sm:flex-none"
                  disabled={
                    Boolean(m.isPrimary) ||
                    markingPrimaryId === m._id ||
                    deletingId === m._id
                  }
                  onClick={() => onMarkPrimary(m._id)}
                  aria-label={labels.markPrimary}
                >
                  {markingPrimaryId === m._id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <>
                      <Star className="mr-1.5 size-3.5" aria-hidden />
                      {labels.markPrimary}
                    </>
                  )}
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={deletingId === m._id || markingPrimaryId === m._id}
                onClick={() => onDelete(m._id)}
                aria-label={labels.deleteButton}
              >
                {deletingId === m._id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
