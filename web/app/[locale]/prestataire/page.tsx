import { ProviderDashboardHome } from "@/components/prestataire/provider-dashboard-home";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function PrestataireDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return <ProviderDashboardHome locale={locale} labels={dict.providerDashboard} />;
}
