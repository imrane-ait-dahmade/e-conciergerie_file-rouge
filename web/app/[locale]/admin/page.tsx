import { AdminStatsSection } from "@/components/admin/admin-stats-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:gap-10 lg:gap-12">
      <header className="flex flex-col gap-4 border-b border-border/60 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.adminSidebar.dashboard}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {dict.adminStats.pageIntro}
        </p>
      </header>

      <AdminStatsSection labels={dict.adminStats} locale={locale} />
    </div>
  );
}
