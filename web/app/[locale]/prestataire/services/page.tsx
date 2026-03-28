import { ProviderEstablishmentServicesSection } from "@/components/prestataire/provider-establishment-services-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function PrestataireServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <ProviderEstablishmentServicesSection
      labels={dict.providerEstablishmentServices}
      locale={locale}
    />
  );
}
