// Même en-tête que la home pour /login (hors préfixe /fr).

import { Header } from "@/components/layout/header";
import { getDictionary } from "@/lib/get-dictionary";
import { defaultLocale } from "@/lib/i18n-config";

export default async function LoginRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary(defaultLocale);
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        locale={defaultLocale}
        dict={{ brand: dict.brand, login: dict.login, register: dict.register }}
      />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
