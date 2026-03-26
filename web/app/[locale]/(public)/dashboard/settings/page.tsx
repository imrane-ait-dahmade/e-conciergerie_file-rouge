import { DashboardSubpagePlaceholder } from "@/components/dashboard/dashboard-subpage-placeholder";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function DashboardSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <DashboardSubpagePlaceholder
      title={dict.dashboardSidebar.settings}
      description={dict.dashboardSidebar.placeholderLead}
    />
  );
}
