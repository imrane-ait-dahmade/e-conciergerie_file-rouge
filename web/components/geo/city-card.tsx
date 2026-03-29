"use client";

import { ImageOff, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchCityPrimaryImage } from "@/lib/api/geo-media";
import { cn } from "@/lib/utils";

export type CityCardProps = {
  cityId: string;
  name: string;
  description?: string;
  /** URL d’image (évite le fetch si déjà connue) */
  imageSrc?: string | null;
  className?: string;
};

/**
 * Carte ville avec image principale (GET /cities/:id/media/primary) ou repli visuel.
 */
export function CityCard({
  cityId,
  name,
  description,
  imageSrc,
  className,
}: CityCardProps) {
  const [src, setSrc] = useState<string | null>(
    imageSrc === undefined ? null : imageSrc,
  );
  const [loading, setLoading] = useState(
    Boolean(cityId && imageSrc === undefined),
  );

  useEffect(() => {
    if (imageSrc !== undefined) {
      setSrc(imageSrc);
      setLoading(false);
      return;
    }
    if (!cityId) {
      setSrc(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchCityPrimaryImage(cityId).then((row) => {
      if (cancelled) return;
      setSrc(row?.url ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [cityId, imageSrc]);

  return (
    <Card
      size="sm"
      className={cn(
        "gap-0 overflow-hidden py-0 transition-shadow hover:ring-foreground/15",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] w-full bg-muted",
          loading && "animate-pulse",
        )}
      >
        {loading ? null : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground"
            role="img"
            aria-label={`${name} — pas d’image`}
          >
            <MapPin className="h-10 w-10 opacity-60" strokeWidth={1.25} />
            <span className="flex items-center gap-1 text-xs font-medium opacity-80">
              <ImageOff className="h-3.5 w-3.5" aria-hidden />
              Pas d’image
            </span>
          </div>
        )}
      </div>
      <CardHeader className="border-t border-foreground/5 px-4 pt-3 pb-4">
        <CardTitle className="line-clamp-2 text-base">{name}</CardTitle>
        {description ? (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        ) : null}
      </CardHeader>
    </Card>
  );
}
