import { ProviderEstablishmentServiceCaracteristiquesSection } from "@/components/prestataire/provider-establishment-service-caracteristiques-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function PrestataireCaracteristiquesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <ProviderEstablishmentServiceCaracteristiquesSection
      labels={dict.providerEstablishmentServiceCaracteristiques}
      locale={locale}
    />
  );
}
