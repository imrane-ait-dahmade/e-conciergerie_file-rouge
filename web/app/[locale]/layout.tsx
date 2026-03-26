import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n-config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Layout racine des routes localisées : pas d’en-tête marketing ici.
 * Le site public utilise le groupe `(public)` ; l’admin a son propre layout sous `/admin`.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return children;
}
