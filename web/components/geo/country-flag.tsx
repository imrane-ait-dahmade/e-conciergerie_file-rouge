"use client";

import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { fetchCountryPrimaryImage } from "@/lib/api/geo-media";

const sizeClass = {
  sm: "h-8 w-8 min-h-8 min-w-8",
  md: "h-10 w-10 min-h-10 min-w-10",
  lg: "h-14 w-14 min-h-14 min-w-14",
} as const;

export type CountryFlagProps = {
  /** Charge l’image via GET /countries/:id/media/primary */
  countryId?: string;
  /** URL directe (prioritaire sur countryId) */
  src?: string | null;
  /** Texte alternatif (ex. nom du pays) */
  alt?: string;
  className?: string;
  size?: keyof typeof sizeClass;
};

/**
 * Drapeau / image pays (ratio carré). Fallback neutre si pas d’image.
 */
export function CountryFlag({
  countryId,
  src,
  alt = "",
  className,
  size = "md",
}: CountryFlagProps) {
  const [resolved, setResolved] = useState<string | null>(
    src === undefined ? null : src,
  );
  const [loading, setLoading] = useState(Boolean(countryId && src === undefined));

  useEffect(() => {
    if (src !== undefined) {
      setResolved(src);
      setLoading(false);
      return;
    }
    if (!countryId) {
      setResolved(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchCountryPrimaryImage(countryId).then((row) => {
      if (cancelled) return;
      setResolved(row?.url ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [countryId, src]);

  const dim = sizeClass[size];

  if (loading) {
    return (
      <div
        className={cn(
          "shrink-0 animate-pulse rounded-full bg-muted ring-1 ring-foreground/10",
          dim,
          className,
        )}
        aria-hidden
      />
    );
  }

  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URLs MinIO variables ; pas besoin de remotePatterns
      <img
        src={resolved}
        alt={alt}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-foreground/10",
          dim,
          className,
        )}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-foreground/10",
        dim,
        className,
      )}
      role="img"
      aria-label={alt || "Pays"}
    >
      <Globe className="h-[45%] w-[45%]" strokeWidth={1.5} aria-hidden />
    </div>
  );
}
