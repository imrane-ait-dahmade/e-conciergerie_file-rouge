import type { ReactNode } from "react";

import { ProviderDashboardShell } from "@/components/prestataire/provider-dashboard-shell";
import { PrestataireSidebar } from "@/components/prestataire/prestataire-sidebar";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function PrestataireLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-dvh w-full flex-col gap-6 bg-slate-50 text-foreground md:flex-row md:items-stretch md:gap-8">
      <PrestataireSidebar locale={locale} labels={dict.providerSidebar} />
      <main className="min-h-[min(60vh,calc(100dvh-2rem))] min-w-0 flex-1 overflow-x-hidden px-5 py-8 md:px-10 md:py-10 lg:pl-12">
        <ProviderDashboardShell>{children}</ProviderDashboardShell>
      </main>
    </div>
  );
}
