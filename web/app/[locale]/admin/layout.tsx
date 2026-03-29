import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

/**
 * Layout serveur pour `/[locale]/admin/*`.
 *
 * - Charge les libellés (dictionnaire) puis délègue le shell client (`AdminShell`).
 * - `AdminShell` applique `RequireRole` (admin) + sidebar + zone de contenu.
 * - Non connecté → redirection vers `/{locale}/login`.
 * - Mauvais rôle → carte « Espace réservé » (`AccessDenied`).
 */
export default async function AdminLayout({
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
    <AdminShell locale={locale} labels={dict.adminSidebar}>
      {children}
    </AdminShell>
  );
}
