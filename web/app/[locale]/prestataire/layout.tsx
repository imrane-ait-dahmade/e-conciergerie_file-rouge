import type { ReactNode } from "react";

import { PrestataireShell } from "@/components/prestataire/prestataire-shell";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

/**
 * Layout serveur pour `/[locale]/prestataire/*` (espace fournisseur).
 * L’alias `/[locale]/provider/*` redirige ici (`next.config.ts`).
 *
 * - `PrestataireShell` : `RequireRole` (prestataire) + sidebar + contenu.
 * - Non connecté → redirection login.
 * - Mauvais rôle → `AccessDenied`.
 */
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
    <PrestataireShell locale={locale} labels={dict.providerSidebar}>
      {children}
    </PrestataireShell>
  );
}
