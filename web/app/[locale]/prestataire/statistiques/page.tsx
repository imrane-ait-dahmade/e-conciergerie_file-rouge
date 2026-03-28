import { ProviderStatisticsSection } from "@/components/prestataire/provider-statistics-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function PrestataireStatistiquesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <ProviderStatisticsSection locale={locale} labels={dict.providerStatistics} />
  );
}
