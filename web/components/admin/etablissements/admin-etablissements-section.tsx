"use client";

import { AdminEtablissementsTable } from "@/components/admin/etablissements/admin-etablissements-table";
import { Card, CardContent } from "@/components/ui/card";
import type { CommonDictionary } from "@/lib/get-dictionary";

export type AdminEtablissementsSectionProps = {
  labels: CommonDictionary["adminEtablissements"];
  filterButtonLabel: string;
  locale: string;
};

export function AdminEtablissementsSection({
  labels,
  filterButtonLabel,
  locale,
}: AdminEtablissementsSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-1 sm:gap-12 sm:px-0">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {labels.pageTitle}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {labels.pageDescription}
        </p>
      </header>

      <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-md">
        <CardContent className="p-0">
          <AdminEtablissementsTable
            labels={labels}
            filterButtonLabel={filterButtonLabel}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
