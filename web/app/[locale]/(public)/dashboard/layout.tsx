import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function DashboardSegmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
      <DashboardSidebar locale={locale} labels={dict.dashboardSidebar} />
      <div className="min-h-[min(60vh,calc(100dvh-12rem))] min-w-0 flex-1 bg-background px-5 py-8 md:px-10 md:py-10 lg:pl-12">
        {children}
      </div>
    </div>
  );
}
