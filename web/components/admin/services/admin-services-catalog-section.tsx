"use client";

import type { ReactNode } from "react";

import { CaracteristiquesTable } from "@/components/admin/caracteristiques/caracteristiques-table";
import { DomainesTable } from "@/components/admin/domaines/domaines-table";
import { ServicesTable } from "@/components/admin/services/services-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CommonDictionary } from "@/lib/get-dictionary";

export type AdminServicesCatalogSectionProps = {
  labels: CommonDictionary["adminServicesCatalog"];
};

/**
 * Page admin : domaines, services et caractéristiques (données factices pour la maquette).
 */
export function AdminServicesCatalogSection({ labels }: AdminServicesCatalogSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-1 sm:gap-12 sm:px-0">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {labels.pageTitle}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {labels.pageSubtitle}
        </p>
        {labels.mockNote ? (
          <p className="text-sm text-muted-foreground/90">{labels.mockNote}</p>
        ) : null}
      </header>

      <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-md">
        <CardContent className="px-5 pb-10 pt-9 sm:px-8 sm:pb-12 sm:pt-10 lg:px-10">
          <Tabs defaultValue="domaines" className="w-full">
            <TabsList variant="line" className="mb-8 w-full min-w-0 justify-start gap-1 sm:mb-10 sm:w-auto">
              <TabsTrigger value="domaines" className="px-4 py-2 text-base sm:text-sm">
                {labels.tabDomaines}
              </TabsTrigger>
              <TabsTrigger value="services" className="px-4 py-2 text-base sm:text-sm">
                {labels.tabServices}
              </TabsTrigger>
              <TabsTrigger value="caracteristiques" className="px-4 py-2 text-base sm:text-sm">
                {labels.tabCaracteristiques}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="domaines" className="mt-0 outline-none focus-visible:outline-none">
              <CatalogTableCard
                title={labels.domainesCardTitle}
                description={labels.domainesCardDescription}
              >
                <DomainesTable labels={labels} />
              </CatalogTableCard>
            </TabsContent>

            <TabsContent value="services" className="mt-0 outline-none focus-visible:outline-none">
              <CatalogTableCard
                title={labels.servicesCardTitle}
                description={labels.servicesCardDescription}
              >
                <ServicesTable labels={labels} />
              </CatalogTableCard>
            </TabsContent>

            <TabsContent
              value="caracteristiques"
              className="mt-0 outline-none focus-visible:outline-none"
            >
              <CatalogTableCard
                title={labels.caracteristiquesCardTitle}
                description={labels.caracteristiquesCardDescription}
              >
                <CaracteristiquesTable labels={labels} />
              </CatalogTableCard>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function CatalogTableCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-xl border-border/60 bg-slate-50/80 shadow-sm dark:bg-muted/20">
      <CardHeader className="space-y-1 border-b border-border/50 pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
