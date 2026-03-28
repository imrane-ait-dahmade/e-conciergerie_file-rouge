import { ProviderEtablissementsSection } from "@/components/prestataire/provider-etablissements-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function PrestataireEtablissementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return <ProviderEtablissementsSection labels={dict.providerEtablissements} locale={locale} />;
}
