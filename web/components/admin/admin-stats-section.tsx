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
import { Building2, ClipboardList, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
};

/** Couleurs = `--chart-*` / thème dans `app/globals.css`. */
const CHART_BAR_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
] as const;
const CHART_AREA_FILL = "var(--chart-1)";
const CHART_AREA_STROKE = "var(--chart-2)";
const CHART_PIE_FILLS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"] as const;

/** Gouttière autour de chaque carte (padding du cellule grille → pas d’overflow horizontal). */
const CARD_GUTTER = "p-1.5 sm:p-2 md:p-2.5 min-w-0";

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

export function AdminStatsSection({
  labels,
  locale,
}: {
  labels: AdminStatsLabels;
  locale: string;
}) {
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const gradientId = React.useId().replace(/:/g, "");

  const byType = React.useMemo(
    () => [
      { name: labels.serviceLodging, value: 32 },
      { name: labels.serviceDining, value: 26 },
      { name: labels.serviceLeisure, value: 19 },
      { name: labels.serviceMobility, value: 14 },
    ],
    [labels],
  );

  const volumeSeries = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        name: String(i + 1),
        volume: 120 + Math.round(Math.sin(i * 0.5) * 35) + i * 8,
      })),
    [],
  );

  const pie = React.useMemo(
    () => [
      { name: labels.pieUsers, value: 48 },
      { name: labels.pieBookings, value: 32 },
      { name: labels.pieListings, value: 20 },
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
      aria-labelledby="admin-stats-heading"
    >
      <div className="space-y-4">
        <h2 id="admin-stats-heading" className="text-xl font-semibold tracking-tight">
          {labels.sectionTitle}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{labels.sectionLead}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-3 lg:gap-6">
        <div className={CARD_GUTTER}>
          <KpiCard title={labels.kpiUsers} value={nf.format(1840)} icon={Users} className="h-full" />
        </div>
        <div className={CARD_GUTTER}>
          <KpiCard title={labels.kpiEstablishments} value={nf.format(126)} icon={Building2} className="h-full" />
        </div>
        <div className={CARD_GUTTER}>
          <KpiCard title={labels.kpiMonthlyBookings} value={nf.format(512)} icon={ClipboardList} className="h-full" />
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
              <div className="h-[240px] w-full [&_.recharts-surface]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byType} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
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
                      {byType.map((_, i) => (
                        <Cell key={i} fill={CHART_BAR_FILLS[i % CHART_BAR_FILLS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
      </div>

      <div className={CARD_GUTTER}>
        <Card className="border-border/80 shadow-sm ring-0">
          <CardHeader className="space-y-1 border-b border-border/60 pb-5 pt-1">
            <CardTitle className="text-base">{labels.chartVolumeTrend}</CardTitle>
            <CardDescription>{labels.mockNote}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 pt-6">
            <div className="h-[260px] w-full [&_.recharts-surface]:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeSeries} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
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
                    width={40}
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
                    dataKey="volume"
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
      </div>

      <p className="pt-2 text-center text-xs leading-relaxed text-muted-foreground">{labels.mockNote}</p>
    </section>
  );
}
