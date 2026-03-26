import { Header } from "@/components/layout/header";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function PublicLayout({
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
    <div className="flex min-h-screen flex-col">
      <Header
        locale={locale}
        dict={{ brand: dict.brand, login: dict.login, register: dict.register }}
      />
      <main className="relative flex min-h-0 w-full flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
