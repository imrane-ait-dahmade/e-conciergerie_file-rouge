import { AdminEtablissementServicesSection } from "@/components/admin/etablissement-services/admin-etablissement-services-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function AdminEtablissementServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return <AdminEtablissementServicesSection labels={dict.adminEtablissementServices} />;
}
