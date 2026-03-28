"use client";

import { EtablissementServicesTable } from "@/components/admin/etablissement-services/etablissement-services-table";
import type { CommonDictionary } from "@/lib/get-dictionary";

export type AdminEtablissementServicesSectionProps = {
  labels: CommonDictionary["adminEtablissementServices"];
};

export function AdminEtablissementServicesSection({
  labels,
}: AdminEtablissementServicesSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-1 sm:gap-12 sm:px-0">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {labels.pageTitle}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {labels.pageDescription}
        </p>
      </header>

      <EtablissementServicesTable labels={labels} />
    </div>
  );
}
