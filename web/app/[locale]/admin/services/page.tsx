import { AdminSubpagePlaceholder } from "@/components/admin/admin-subpage-placeholder";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <AdminSubpagePlaceholder
      title={dict.adminSidebar.services}
      description={dict.adminSidebar.placeholderLead}
    />
  );
}
