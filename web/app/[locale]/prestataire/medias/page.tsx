import { ProviderPageHeader } from "@/components/prestataire/provider-dashboard-shell";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function PrestataireMediasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <ProviderPageHeader
      title={dict.providerSidebar.medias}
      description="À venir — médias et photos."
    />
  );
}
