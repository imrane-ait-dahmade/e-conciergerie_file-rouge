"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaysTable } from "@/components/admin/pays/pays-table";
import { VillesTable } from "@/components/admin/villes/villes-table";
import { QuartiersTable } from "@/components/admin/quartiers/quartiers-table";

import type { CommonDictionary } from "@/lib/get-dictionary";

export type AdminGeographieSectionLabels = CommonDictionary["adminGeographie"];

type AdminGeographieSectionProps = {
  labels: AdminGeographieSectionLabels;
  locale: string;
};

/**
 * Page « Gestion géographique » : onglets Pays / Villes / Quartiers (données fictives).
 */
export function AdminGeographieSection({ labels, locale }: AdminGeographieSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {labels.pageTitle}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {labels.pageDescription}
        </p>
        <p className="text-xs text-muted-foreground/90">{labels.mockDataNote}</p>
      </header>

      <Tabs defaultValue="pays" className="w-full gap-6">
        <TabsList variant="line" className="w-full justify-start md:w-auto">
          <TabsTrigger value="pays">{labels.tabPays}</TabsTrigger>
          <TabsTrigger value="villes">{labels.tabVilles}</TabsTrigger>
          <TabsTrigger value="quartiers">{labels.tabQuartiers}</TabsTrigger>
        </TabsList>

        <TabsContent value="pays" className="mt-0">
          <PaysTable columnLabels={labels.paysColumns} />
        </TabsContent>

        <TabsContent value="villes" className="mt-0">
          <VillesTable columnLabels={labels.villesColumns} locale={locale} />
        </TabsContent>

        <TabsContent value="quartiers" className="mt-0">
          <QuartiersTable columnLabels={labels.quartiersColumns} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
