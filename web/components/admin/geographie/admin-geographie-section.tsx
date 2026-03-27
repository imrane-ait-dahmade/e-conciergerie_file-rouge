"use client";

import { PaysTable } from "@/components/admin/pays/pays-table";
import { QuartiersTable } from "@/components/admin/quartiers/quartiers-table";
import { VillesTable } from "@/components/admin/villes/villes-table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CommonDictionary } from "@/lib/get-dictionary";

export type AdminGeographieSectionProps = {
  labels: CommonDictionary["adminGeographie"];
};

export function AdminGeographieSection({ labels }: AdminGeographieSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-1 sm:gap-12 sm:px-0">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{labels.pageTitle}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{labels.pageDescription}</p>
        <p className="text-sm text-muted-foreground/90">{labels.mockDataNote}</p>
      </header>

      <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-md">
        <CardContent className="px-5 pb-10 pt-9 sm:px-8 sm:pb-12 sm:pt-10 lg:px-10">
          <Tabs defaultValue="pays" className="w-full">
            <TabsList variant="line" className="mb-8 w-full min-w-0 justify-start gap-1 sm:mb-10 sm:w-auto">
              <TabsTrigger value="pays" className="px-4 py-2 text-base sm:text-sm">
                {labels.tabPays}
              </TabsTrigger>
              <TabsTrigger value="villes" className="px-4 py-2 text-base sm:text-sm">
                {labels.tabVilles}
              </TabsTrigger>
              <TabsTrigger value="quartiers" className="px-4 py-2 text-base sm:text-sm">
                {labels.tabQuartiers}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pays" className="mt-0 outline-none focus-visible:outline-none">
              <PaysTable labels={labels} />
            </TabsContent>

            <TabsContent value="villes" className="mt-0 outline-none focus-visible:outline-none">
              <VillesTable labels={labels} />
            </TabsContent>

            <TabsContent value="quartiers" className="mt-0 outline-none focus-visible:outline-none">
              <QuartiersTable labels={labels} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
