import { AdminEtablissementsSection } from "@/components/admin/etablissements/admin-etablissements-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function AdminEtablissementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <AdminEtablissementsSection
      labels={dict.adminEtablissements}
      filterButtonLabel={dict.adminGeographie.toolbar.filter}
      locale={locale}
    />
  );
}
