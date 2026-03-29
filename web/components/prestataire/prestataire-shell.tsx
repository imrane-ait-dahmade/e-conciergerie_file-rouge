"use client";

import type { ReactNode } from "react";

import { RequireRole } from "@/components/auth/require-role";
import { PrestataireSidebar, type PrestataireSidebarLabels } from "@/components/prestataire/prestataire-sidebar";
import { ProviderDashboardShell } from "@/components/prestataire/provider-dashboard-shell";
import { RoleName } from "@/lib/permissions/roles";

type PrestataireShellProps = {
  locale: string;
  labels: PrestataireSidebarLabels;
  children: ReactNode;
};

/**
 * Enveloppe prestataire : garde de rôle + barre latérale + contenu.
 * Route : voir `hrefPrestataire()` dans `lib/routes/protected-areas.ts`.
 */
export function PrestataireShell({ locale, labels, children }: PrestataireShellProps) {
  return (
    <RequireRole locale={locale} allowedRoles={[RoleName.Prestataire]}>
      <div className="flex min-h-dvh w-full flex-col gap-6 bg-slate-50 text-foreground md:flex-row md:items-stretch md:gap-8">
        <PrestataireSidebar locale={locale} labels={labels} />
        <main className="min-h-[min(60vh,calc(100dvh-2rem))] min-w-0 flex-1 overflow-x-hidden px-5 py-8 md:px-10 md:py-10 lg:pl-12">
          <ProviderDashboardShell>{children}</ProviderDashboardShell>
        </main>
      </div>
    </RequireRole>
  );
}
