"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  CalendarClock,
  Layers,
  ListChecks,
  Sparkles,
  Star,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchProviderDashboardOverview } from "@/lib/api/provider-dashboard";
import type { ProviderDashboardOverview } from "@/lib/types/provider-dashboard-overview";
import { cn } from "@/lib/utils";

export type ProviderDashboardLabels = {
  pageTitle: string;
  welcomeTitle: string;
  welcomeLead: string;
  statsSectionTitle: string;
  cardEstablishments: string;
  cardEstablishmentsHint: string;
  cardActiveServices: string;
  cardActiveServicesHint: string;
  cardCaracteristiques: string;
  cardCaracteristiquesHint: string;
  cardReservations: string;
  cardReservationsSoon: string;
  cardReviews: string;
  cardReviewsSoon: string;
  recentTitle: string;
  recentEmpty: string;
  quickActionsTitle: string;
  actionEstablishments: string;
  actionServices: string;
  actionStatistics: string;
  actionProfile: string;
  mockDataNote: string;
  reservationStatus: string;
  reviewRating: string;
};

function StatCard({
  title,
  hint,
  value,
  icon: Icon,
  badge,
  className,
}: {
  title: string;
  hint: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  className?: string;
}) {
  return (
    <Card size="sm" className={cn("border-border/80 shadow-sm ring-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-5 pb-2 pt-5">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <CardDescription className="text-xs">{hint}</CardDescription>
        </div>
        <Icon className="size-4 shrink-0 text-primary opacity-80" aria-hidden />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-5 pb-5 pt-0">
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
        {badge ? (
          <span className="inline-flex w-fit rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {badge}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ProviderDashboardHome({
  locale,
  labels,
}: {
  locale: string;
  labels: ProviderDashboardLabels;
}) {
  const [data, setData] = React.useState<ProviderDashboardOverview | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const overview = await fetchProviderDashboardOverview();
      if (!cancelled) {
        setData(overview);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const base = `/${locale}/prestataire`;

  const counts = data?.counts;
  const recent = data?.recent;

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="flex flex-col gap-4 border-b border-border/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="size-6 text-primary" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight">{labels.pageTitle}</h1>
        </div>
        <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/[0.06] to-transparent px-5 py-6">
          <h2 className="text-lg font-medium text-foreground">{labels.welcomeTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{labels.welcomeLead}</p>
        </div>
      </header>

      <section aria-labelledby="provider-stats-heading" className="space-y-4">
        <h2 id="provider-stats-heading" className="text-lg font-semibold tracking-tight">
          {labels.statsSectionTitle}
        </h2>
        {loading || !counts ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-muted/60"
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            <StatCard
              title={labels.cardEstablishments}
              hint={labels.cardEstablishmentsHint}
              value={nf.format(counts.establishmentsTotal)}
              icon={Building2}
            />
            <StatCard
              title={labels.cardActiveServices}
              hint={labels.cardActiveServicesHint}
              value={nf.format(counts.establishmentServicesOnActiveEstablishments)}
              icon={Layers}
            />
            <StatCard
              title={labels.cardCaracteristiques}
              hint={labels.cardCaracteristiquesHint}
              value={nf.format(counts.caracteristiqueAssignments)}
              icon={ListChecks}
            />
            <StatCard
              title={labels.cardReservations}
              hint={labels.cardReservationsSoon}
              value={nf.format(counts.reservationsTotal)}
              icon={CalendarClock}
              badge={labels.cardReservationsSoon}
            />
            <StatCard
              title={labels.cardReviews}
              hint={labels.cardReviewsSoon}
              value={
                data.reviewAverageNote != null
                  ? `${data.reviewAverageNote.toFixed(1)} / 5`
                  : nf.format(counts.reviewsTotal)
              }
              icon={Star}
              badge={labels.cardReviewsSoon}
            />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="provider-recent-heading">
          <Card className="border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle id="provider-recent-heading" className="text-base">
                {labels.recentTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-4">
              {!recent || (recent.reservations.length === 0 && recent.reviews.length === 0) ? (
                <p className="text-sm text-muted-foreground">{labels.recentEmpty}</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {recent.reservations.slice(0, 3).map((r) => (
                    <li
                      key={`r-${r.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
                    >
                      <span className="font-medium text-foreground">
                        {labels.cardReservations}
                      </span>
                      <span className="text-muted-foreground">
                        {labels.reservationStatus}: {r.statut}
                      </span>
                    </li>
                  ))}
                  {recent.reviews.slice(0, 3).map((a) => (
                    <li
                      key={`a-${a.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
                    >
                      <span className="font-medium text-foreground">{labels.cardReviews}</span>
                      <span className="text-muted-foreground">
                        {labels.reviewRating}: {a.note}/5
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="provider-quick-heading">
          <Card className="border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle id="provider-quick-heading" className="text-base">
                {labels.quickActionsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 px-5 py-4">
              <Link
                href={`${base}/etablissements`}
                className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
              >
                {labels.actionEstablishments}
              </Link>
              <Link
                href={`${base}/services`}
                className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
              >
                {labels.actionServices}
              </Link>
              <Link
                href={`${base}/statistiques`}
                className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
              >
                {labels.actionStatistics}
              </Link>
              <Link
                href={`${base}/profil`}
                className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
              >
                {labels.actionProfile}
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">{labels.mockDataNote}</p>
    </div>
  );
}
