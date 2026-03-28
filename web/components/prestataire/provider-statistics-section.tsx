"use client";

import * as React from "react";
import {
  BarChart3,
  Building2,
  CalendarClock,
  Layers,
  LineChart,
  ListChecks,
  PieChart,
  Star,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchProviderStatisticsView,
  type ProviderStatisticsView,
} from "@/lib/api/provider-statistics";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

type Labels = CommonDictionary["providerStatistics"];

function StatCard({
  title,
  hint,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  hint: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
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
      <CardContent className="px-5 pb-5 pt-0">
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function reservationStatusLabel(key: string, labels: Labels): string {
  switch (key) {
    case "demandee":
      return labels.statusDemandee;
    case "confirmee":
      return labels.statusConfirmee;
    case "annulee":
      return labels.statusAnnulee;
    case "terminee":
      return labels.statusTerminee;
    default:
      return key;
  }
}

function formatWhen(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function StatusBars({
  entries,
  labels,
}: {
  entries: [string, number][];
  labels: Labels;
}) {
  const max = Math.max(1, ...entries.map(([, n]) => n));
  return (
    <ul className="space-y-3">
      {entries.map(([key, count]) => (
        <li key={key}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">
              {reservationStatusLabel(key, labels)}
            </span>
            <span className="tabular-nums font-medium text-foreground">{count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/70 transition-all"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function TrendBars({
  values,
  monthLabels,
}: {
  values: number[];
  monthLabels: string[];
}) {
  const max = Math.max(1, ...values);
  return (
    <div
      className="flex h-44 items-end justify-between gap-1 border-b border-border/50 pb-2"
      role="img"
      aria-label="Trend preview"
    >
      {values.map((v, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div
            className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-primary/25 to-primary/55"
            style={{ height: `${Math.max(10, (v / max) * 112)}px` }}
          />
          <span className="truncate text-[10px] text-muted-foreground">{monthLabels[i] ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

export function ProviderStatisticsSection({
  locale,
  labels,
}: {
  locale: string;
  labels: Labels;
}) {
  const [data, setData] = React.useState<ProviderStatisticsView | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const view = await fetchProviderStatisticsView();
      if (!cancelled) {
        setData(view);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const monthLabels = React.useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push(new Intl.DateTimeFormat(locale, { month: "short" }).format(d));
    }
    return out;
  }, [locale]);

  const counts = data?.overview.counts;
  const overview = data?.overview;
  const extras = data?.extras;
  const byStatusEntries = React.useMemo(() => {
    const raw = overview?.reservationsByStatus;
    if (!raw) return [] as [string, number][];
    return Object.entries(raw).sort((a, b) => b[1] - a[1]);
  }, [overview?.reservationsByStatus]);

  const summaryText = React.useMemo(() => {
    if (!counts) return "";
    return labels.summaryEstablishments
      .replace("{{active}}", nf.format(counts.establishmentsActive))
      .replace("{{total}}", nf.format(counts.establishmentsTotal));
  }, [counts, labels.summaryEstablishments, nf]);

  const recentReservations = overview?.recent.reservations ?? [];
  const recentReviews = overview?.recent.reviews ?? [];

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="space-y-2 border-b border-border/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <BarChart3 className="size-7 text-primary" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{labels.pageTitle}</h1>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{labels.pageDescription}</p>
        {!loading && overview?.generatedAt ? (
          <p className="text-xs text-muted-foreground">
            {labels.generatedAt}{" "}
            {formatWhen(overview.generatedAt, locale)}
          </p>
        ) : null}
      </header>

      <section aria-labelledby="stats-kpis" className="space-y-4">
        <h2 id="stats-kpis" className="text-lg font-semibold tracking-tight">
          {labels.sectionKpis}
        </h2>
        {loading || !counts ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/60" aria-hidden />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <StatCard
              title={labels.cardEstablishments}
              hint={labels.cardEstablishmentsHint}
              value={nf.format(counts.establishmentsTotal)}
              icon={Building2}
            />
            <StatCard
              title={labels.cardEstablishmentsActive}
              hint={labels.cardEstablishmentsActiveHint}
              value={nf.format(counts.establishmentsActive)}
              icon={Building2}
            />
            <StatCard
              title={labels.cardServices}
              hint={labels.cardServicesHint}
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
              hint={labels.cardReservationsHint}
              value={nf.format(counts.reservationsTotal)}
              icon={CalendarClock}
            />
            <StatCard
              title={labels.cardReviews}
              hint={labels.cardReviewsHint}
              value={
                overview?.reviewAverageNote != null
                  ? `${overview.reviewAverageNote.toFixed(1)} / 5`
                  : nf.format(counts.reviewsTotal)
              }
              icon={Star}
            />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="stats-status">
          <Card className="h-full border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <PieChart className="size-4 text-muted-foreground" aria-hidden />
                <CardTitle id="stats-status" className="text-base">
                  {labels.sectionByStatus}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4">
              {loading || !overview ? (
                <div className="h-32 animate-pulse rounded-lg bg-muted/50" />
              ) : byStatusEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{labels.chartEmpty}</p>
              ) : (
                <StatusBars entries={byStatusEntries} labels={labels} />
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="stats-trend">
          <Card className="h-full border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <LineChart className="size-4 text-muted-foreground" aria-hidden />
                <CardTitle id="stats-trend" className="text-base">
                  {labels.sectionTrend}
                </CardTitle>
              </div>
              <CardDescription>{labels.trendPlaceholder}</CardDescription>
            </CardHeader>
            <CardContent className="px-5 py-4">
              {loading || !extras ? (
                <div className="h-44 animate-pulse rounded-lg bg-muted/50" />
              ) : (
                <TrendBars values={extras.monthlyReservationTrend} monthLabels={monthLabels} />
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <section aria-labelledby="stats-summary">
        <Card className="border-border/80 bg-muted/20 shadow-sm ring-0">
          <CardHeader className="pb-2 pt-5">
            <CardTitle id="stats-summary" className="text-base">
              {labels.sectionSummary}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-5 pt-0">
            {loading || !counts ? (
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted/60" />
            ) : (
              <p className="text-sm leading-relaxed text-foreground">{summaryText}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="stats-recent">
          <Card className="border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle id="stats-recent" className="text-base">
                {labels.sectionRecent}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-4">
              {loading || !overview ? (
                <div className="space-y-2">
                  <div className="h-10 animate-pulse rounded-lg bg-muted/50" />
                  <div className="h-10 animate-pulse rounded-lg bg-muted/50" />
                </div>
              ) : recentReservations.length === 0 && recentReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">{labels.recentEmpty}</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {recentReservations.slice(0, 5).map((r) => (
                    <li
                      key={`r-${r.id}`}
                      className="flex flex-col gap-0.5 rounded-lg border border-border/50 bg-background/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-foreground">{labels.cardReservations}</span>
                      <span className="text-muted-foreground">
                        {labels.reservationStatus}: {reservationStatusLabel(r.statut, labels)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatWhen(r.createdAt, locale)}
                      </span>
                    </li>
                  ))}
                  {recentReviews.slice(0, 5).map((a) => (
                    <li
                      key={`a-${a.id}`}
                      className="flex flex-col gap-0.5 rounded-lg border border-border/50 bg-background/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-foreground">{labels.cardReviews}</span>
                      <span className="text-muted-foreground">
                        {labels.reviewRating}: {a.note}/5
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatWhen(a.createdAt, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="stats-top-services">
          <Card className="border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
                <CardTitle id="stats-top-services" className="text-base">
                  {labels.sectionTopServices}
                </CardTitle>
              </div>
              <CardDescription>{labels.extrasNote}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading || !extras ? (
                <div className="p-5">
                  <div className="h-24 animate-pulse rounded-lg bg-muted/50" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{labels.topServicesColService}</TableHead>
                      <TableHead className="text-right">{labels.topServicesColCount}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extras.topServices.map((row) => (
                      <TableRow key={row.serviceName}>
                        <TableCell className="font-medium">{row.serviceName}</TableCell>
                        <TableCell className="text-right tabular-nums">{nf.format(row.count)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">{labels.dataSourceNote}</p>
    </div>
  );
}
