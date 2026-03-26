import { AdminGeographieSection } from "@/components/admin/geographie/admin-geographie-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function AdminGeographiePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return <AdminGeographieSection labels={dict.adminGeographie} locale={locale} />;
}
