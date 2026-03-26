import { LoginForm } from "@/components/auth/login-form";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/** Page de connexion (locale dans l’URL : /fr/login, …) — même carte centrée que /login. */
export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <div className="auth-page__inner">
      <LoginForm
          locale={locale}
          signupHref={`/${locale}/signup`}
          copy={dict.loginPage}
        />
    </div>
  );
}
