import { AdminUsersSection } from "@/components/admin/users/admin-users-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <AdminUsersSection
      labels={dict.adminUsers}
      filterButtonLabel={dict.adminGeographie.toolbar.filter}
      locale={locale}
    />
  );
}
