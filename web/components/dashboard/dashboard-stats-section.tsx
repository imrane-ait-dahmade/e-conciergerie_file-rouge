"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
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
import { CalendarDays, Heart, Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Aligné sur `CommonDictionary["dashboardStats"]`. */
export type DashboardStatsLabels = {
  pageIntro: string;
  sectionTitle: string;
  sectionLead: string;
  kpiReservations: string;
  kpiFavorites: string;
  kpiSearches: string;
  chartByCategory: string;
  chartActivity: string;
  chartDistribution: string;
  mockNote: string;
  tooltipValue: string;
  categoryRestaurants: string;
  categoryLodging: string;
  categoryTransport: string;
  categoryWellness: string;
  pieReservations: string;
  pieFavorites: string;
  pieMessages: string;
};

/** Couleurs graphiques = tokens `--chart-*` dans `app/globals.css` (thème clair / sombre). */
const CHART_BAR_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
] as const;
const CHART_AREA_FILL = "var(--chart-1)";
const CHART_AREA_STROKE = "var(--chart-2)";
const CHART_PIE_FILLS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"] as const;

function KpiCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
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
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStatsSection({
  labels,
  locale,
}: {
  labels: DashboardStatsLabels;
  locale: string;
}) {
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const gradientId = React.useId().replace(/:/g, "");

  const byCategory = React.useMemo(
    () => [
      { name: labels.categoryRestaurants, value: 24 },
      { name: labels.categoryLodging, value: 18 },
      { name: labels.categoryTransport, value: 11 },
      { name: labels.categoryWellness, value: 15 },
    ],
    [labels],
  );

  const weekly = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        name: String(i + 1),
        interactions: 6 + Math.round(Math.sin(i * 0.55) * 5) + i,
      })),
    [],
  );

  const pie = React.useMemo(
    () => [
      { name: labels.pieReservations, value: 42 },
      { name: labels.pieFavorites, value: 33 },
      { name: labels.pieMessages, value: 25 },
    ],
    [labels],
  );

  const tooltipStyle = React.useMemo(
    () => ({
      borderRadius: 8,
      border: "1px solid var(--border)",
      background: "var(--card)",
      fontSize: 12,
    }),
    [],
  );

  return (
    <section
      className="flex flex-col gap-6 md:gap-8 lg:gap-10"
      aria-labelledby="dashboard-stats-heading"
    >
      <div className="space-y-4">
        <h2 id="dashboard-stats-heading" className="text-xl font-semibold tracking-tight">
          {labels.sectionTitle}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{labels.sectionLead}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 lg:gap-8">
        <KpiCard title={labels.kpiReservations} value={nf.format(3)} icon={CalendarDays} />
        <KpiCard title={labels.kpiFavorites} value={nf.format(14)} icon={Heart} />
        <KpiCard title={labels.kpiSearches} value={nf.format(28)} icon={Search} />
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="border-border/80 shadow-sm ring-0 lg:min-h-[320px]">
          <CardHeader className="space-y-1 border-b border-border/60 pb-5 pt-1">
            <CardTitle className="text-base">{labels.chartByCategory}</CardTitle>
            <CardDescription>{labels.mockNote}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 pt-6">
            <div className="h-[240px] w-full [&_.recharts-surface]:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
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
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_BAR_FILLS[i % CHART_BAR_FILLS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm ring-0 lg:min-h-[320px]">
          <CardHeader className="space-y-1 border-b border-border/60 pb-5 pt-1">
            <CardTitle className="text-base">{labels.chartDistribution}</CardTitle>
            <CardDescription>{labels.mockNote}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 pt-6">
            <div className="flex h-[240px] w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8 [&_.recharts-surface]:outline-none">
              <div className="h-[200px] w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {pie.map((_, i) => (
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
                        return [`${n}%`, labels.tooltipValue];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:mt-0 sm:flex-col sm:justify-center">
                {pie.map((row, i) => (
                  <li key={row.name} className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: CHART_PIE_FILLS[i % CHART_PIE_FILLS.length] }}
                    />
                    <span>
                      {row.name} ({row.value}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm ring-0">
        <CardHeader className="space-y-1 border-b border-border/60 pb-5 pt-1">
          <CardTitle className="text-base">{labels.chartActivity}</CardTitle>
          <CardDescription>{labels.mockNote}</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-6 pt-6">
          <div className="h-[260px] w-full [&_.recharts-surface]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_AREA_FILL} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_AREA_FILL} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" vertical={false} className="stroke-border/80" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
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
                <Area
                  type="monotone"
                  dataKey="interactions"
                  stroke={CHART_AREA_STROKE}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <p className="pt-2 text-center text-xs leading-relaxed text-muted-foreground">{labels.mockNote}</p>
    </section>
  );
}
