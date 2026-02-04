import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale, locales } from "@/lib/i18n-config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
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
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
