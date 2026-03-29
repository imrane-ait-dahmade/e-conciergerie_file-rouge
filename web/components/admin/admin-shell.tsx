"use client";

import type { ReactNode } from "react";

import { RequireRole } from "@/components/auth/require-role";
import { AdminSidebar, type AdminSidebarLabels } from "@/components/admin/admin-sidebar";
import { RoleName } from "@/lib/permissions/roles";

type AdminShellProps = {
  locale: string;
  labels: AdminSidebarLabels;
  children: ReactNode;
};

/**
 * Enveloppe admin : garde de rôle + barre latérale + contenu.
 * Route : voir `hrefAdmin()` dans `lib/routes/protected-areas.ts`.
 */
export function AdminShell({ locale, labels, children }: AdminShellProps) {
  return (
    <RequireRole locale={locale} allowedRoles={[RoleName.Admin]}>
      <div className="flex min-h-dvh w-full flex-col gap-6 bg-slate-50 text-foreground md:flex-row md:items-stretch md:gap-8">
        <AdminSidebar locale={locale} labels={labels} />
        <div className="min-h-[min(60vh,calc(100dvh-2rem))] min-w-0 flex-1 overflow-x-hidden px-5 py-8 md:px-10 md:py-10 lg:pl-12">
          {children}
        </div>
      </div>
    </RequireRole>
  );
}
