"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, Briefcase, Building2, Layers, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { fetchAdminDashboardStats } from "@/lib/api/admin-dashboard";
import { ApiRequestError } from "@/lib/api/api-request-error";
import type { AdminDashboardStats } from "@/lib/types/admin-dashboard-stats";

/** Aligné sur `CommonDictionary["adminStats"]`. */
export type AdminStatsLabels = {
  pageIntro: string;
  sectionTitle: string;
  sectionLead: string;
  kpiUsers: string;
  kpiEstablishments: string;
  kpiMonthlyBookings: string;
  chartServicesByType: string;
  chartVolumeTrend: string;
  chartTrafficMix: string;
  mockNote: string;
  tooltipValue: string;
  serviceLodging: string;
  serviceDining: string;
  serviceLeisure: string;
  serviceMobility: string;
  pieUsers: string;
  pieBookings: string;
  pieListings: string;
  kpiProviders: string;
  kpiEstablishmentServices: string;
  loading: string;
  loadError: string;
  retry: string;
  recentSectionTitle: string;
  colName: string;
  colEmail: string;
  colCity: string;
  colDomain: string;
  colService: string;
  colEstablishment: string;
  colActive: string;
  colDate: string;
  colPrice: string;
  emptyState: string;
};

const CHART_BAR_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
] as const;
const CHART_PIE_FILLS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"] as const;

const CARD_GUTTER = "p-1.5 sm:p-2 md:p-2.5 min-w-0";

function formatShortDate(iso: string | undefined, locale: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function KpiCard({
  title,
  value,
  icon: Icon,
  className,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
  loading?: boolean;
}) {
  return (
    <Card
      size="sm"
      className={cn("border-border/80 shadow-sm ring-0", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pb-3 pt-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-primary opacity-80" aria-hidden />
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p
          className={cn(
            "text-2xl font-bold tabular-nums tracking-tight text-foreground",
            loading && "animate-pulse text-muted-foreground",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] w-full items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function AdminStatsSection({
  labels,
  locale,
}: {
  labels: AdminStatsLabels;
  locale: string;
}) {
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [data, setData] = React.useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchAdminDashboardStats();
      setData(stats);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : labels.loadError;
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [labels.loadError]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const tooltipStyle = React.useMemo(
    () => ({
      borderRadius: 8,
      border: "1px solid var(--border)",
      background: "var(--card)",
      fontSize: 12,
    }),
    [],
  );

  const byDomain = React.useMemo(() => {
    const rows = data?.charts.establishmentsByDomain ?? [];
    return rows.slice(0, 10).map((r) => ({
      name:
        r.domainName.length > 22 ? `${r.domainName.slice(0, 20)}…` : r.domainName,
      value: r.count,
    }));
  }, [data]);

  const byCity = React.useMemo(() => {
    const rows = data?.charts.establishmentsByCity ?? [];
    return rows.slice(0, 12).map((r) => ({
      name: r.cityName.length > 16 ? `${r.cityName.slice(0, 14)}…` : r.cityName,
      value: r.count,
    }));
  }, [data]);

  const usersRolePie = React.useMemo(() => {
    const rows = data?.charts.usersByRole ?? [];
    const total = rows.reduce((s, r) => s + r.count, 0);
    return rows.map((r) => {
      const label = r.label?.trim() || r.role;
      const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
      return {
        name: label,
        value: r.count,
        pct,
      };
    });
  }, [data]);

  const summary = data?.summary;
  const recent = data?.recent;

  return (
    <section
      className="flex flex-col gap-6 md:gap-8 lg:gap-10"
      aria-labelledby="admin-stats-heading"
    >
      <div className="space-y-4">
        <h2 id="admin-stats-heading" className="text-xl font-semibold tracking-tight">
          {labels.sectionTitle}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{labels.sectionLead}</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{labels.loadError}</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-destructive/90">{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
              {labels.retry}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6">
        <div className={CARD_GUTTER}>
          <KpiCard
            title={labels.kpiUsers}
            value={loading ? "…" : nf.format(summary?.totalUsers ?? 0)}
            icon={Users}
            loading={loading}
            className="h-full"
          />
        </div>
        <div className={CARD_GUTTER}>
          <KpiCard
            title={labels.kpiProviders}
            value={loading ? "…" : nf.format(summary?.totalProviders ?? 0)}
            icon={Briefcase}
            loading={loading}
            className="h-full"
          />
        </div>
        <div className={CARD_GUTTER}>
          <KpiCard
            title={labels.kpiEstablishments}
            value={loading ? "…" : nf.format(summary?.totalEstablishments ?? 0)}
            icon={Building2}
            loading={loading}
            className="h-full"
          />
        </div>
        <div className={CARD_GUTTER}>
          <KpiCard
            title={labels.kpiEstablishmentServices}
            value={loading ? "…" : nf.format(summary?.totalEstablishmentServices ?? 0)}
            icon={Layers}
            loading={loading}
            className="h-full"
          />
        </div>
      </div>

      <div className="grid gap-3 md:gap-5 lg:grid-cols-2 lg:gap-6">
        <div className={CARD_GUTTER}>
          <Card className="border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base">{labels.chartServicesByType}</CardTitle>
              <CardDescription>{labels.mockNote}</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-6 pt-6">
              {loading ? (
                <ChartEmpty message={labels.loading} />
              ) : byDomain.length === 0 ? (
                <ChartEmpty message={labels.emptyState} />
              ) : (
                <div className="h-[240px] w-full [&_.recharts-surface]:outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={byDomain}
                      margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="4 6" vertical={false} className="stroke-border/80" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={48}
                      />
                      <YAxis
                        width={32}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => {
                          const n = typeof value === "number" ? value : Number(value);
                          return [nf.format(n), labels.tooltipValue];
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {byDomain.map((_, i) => (
                          <Cell key={i} fill={CHART_BAR_FILLS[i % CHART_BAR_FILLS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className={CARD_GUTTER}>
          <Card className="border-border/80 shadow-sm ring-0 lg:min-h-[320px]">
            <CardHeader className="space-y-1 border-b border-border/60 pb-5 pt-1">
              <CardTitle className="text-base">{labels.chartTrafficMix}</CardTitle>
              <CardDescription>{labels.mockNote}</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-6 pt-6">
              {!loading && usersRolePie.length === 0 ? (
                <ChartEmpty message={labels.emptyState} />
              ) : (
                <div className="flex h-[240px] w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8 [&_.recharts-surface]:outline-none">
                  <div className="h-[200px] w-full max-w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={usersRolePie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={2}
                        >
                          {usersRolePie.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_PIE_FILLS[i % CHART_PIE_FILLS.length]}
                              stroke="transparent"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => {
                            const n = typeof value === "number" ? value : Number(value);
                            return [nf.format(n), labels.tooltipValue];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:mt-0 sm:flex-col sm:justify-center">
                    {usersRolePie.map((row, i) => (
                      <li key={row.name} className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-sm"
                          style={{
                            backgroundColor: CHART_PIE_FILLS[i % CHART_PIE_FILLS.length],
                          }}
                        />
                        <span>
                          {row.name} ({nf.format(row.value)} — {row.pct}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={CARD_GUTTER}>
        <Card className="border-border/80 shadow-sm ring-0">
          <CardHeader className="space-y-1 border-b border-border/60 pb-5 pt-1">
            <CardTitle className="text-base">{labels.chartVolumeTrend}</CardTitle>
            <CardDescription>{labels.mockNote}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 pt-6">
            {loading ? (
              <ChartEmpty message={labels.loading} />
            ) : byCity.length === 0 ? (
              <ChartEmpty message={labels.emptyState} />
            ) : (
              <div className="h-[260px] w-full [&_.recharts-surface]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCity} margin={{ top: 12, right: 12, left: 4, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} className="stroke-border/80" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-35}
                      textAnchor="end"
                      height={56}
                    />
                    <YAxis
                      width={36}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => {
                        const n = typeof value === "number" ? value : Number(value);
                        return [nf.format(n), labels.tooltipValue];
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
                      {byCity.map((_, i) => (
                        <Cell key={i} fill={CHART_BAR_FILLS[i % CHART_BAR_FILLS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">{labels.recentSectionTitle}</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 py-3">
              <CardTitle className="text-sm font-medium">{labels.kpiUsers}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground">{labels.loading}</p>
              ) : !recent?.recentUsers?.length ? (
                <p className="p-4 text-sm text-muted-foreground">{labels.emptyState}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{labels.colName}</TableHead>
                      <TableHead>{labels.colEmail}</TableHead>
                      <TableHead className="text-end">{labels.colDate}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.recentUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.prenom} {u.nom}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell className="text-end tabular-nums text-muted-foreground">
                          {formatShortDate(u.createdAt, locale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 py-3">
              <CardTitle className="text-sm font-medium">{labels.kpiEstablishments}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground">{labels.loading}</p>
              ) : !recent?.recentEstablishments?.length ? (
                <p className="p-4 text-sm text-muted-foreground">{labels.emptyState}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{labels.colName}</TableHead>
                      <TableHead>{labels.colCity}</TableHead>
                      <TableHead className="text-end">{labels.colDate}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.recentEstablishments.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="max-w-[120px] truncate font-medium">{e.nom}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.ville?.nom ?? "—"}
                        </TableCell>
                        <TableCell className="text-end tabular-nums text-muted-foreground">
                          {formatShortDate(e.createdAt, locale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm ring-0">
            <CardHeader className="border-b border-border/60 py-3">
              <CardTitle className="text-sm font-medium">{labels.kpiEstablishmentServices}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground">{labels.loading}</p>
              ) : !recent?.recentEstablishmentServices?.length ? (
                <p className="p-4 text-sm text-muted-foreground">{labels.emptyState}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{labels.colService}</TableHead>
                      <TableHead>{labels.colEstablishment}</TableHead>
                      <TableHead className="text-end">{labels.colDate}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.recentEstablishmentServices.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="max-w-[100px] truncate font-medium">
                          {row.service?.nom ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[100px] truncate text-muted-foreground">
                          {row.etablissement?.nom ?? "—"}
                        </TableCell>
                        <TableCell className="text-end tabular-nums text-muted-foreground">
                          {formatShortDate(row.createdAt, locale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="pt-2 text-center text-xs leading-relaxed text-muted-foreground">{labels.mockNote}</p>
    </section>
  );
}
