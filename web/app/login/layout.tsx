// Même en-tête que la home pour /login (hors préfixe /fr).
// Fond dégradé + halos animés (AuthPageBackground) sur la zone auth uniquement.

import { AuthPageBackground } from "@/components/auth/auth-page-background";
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
      <main className="auth-page relative flex-1 w-full overflow-hidden">
        <AuthPageBackground />
        <div className="relative z-10 flex min-h-full w-full flex-col items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
