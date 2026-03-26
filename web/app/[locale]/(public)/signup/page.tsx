import { SignupForm } from "@/components/auth/signup-form";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/** Page d’inscription (/fr/signup, …) — carte large + fond auth comme la home. */
export default async function SignupPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <div className="auth-page__inner auth-page__inner--wide">
      <SignupForm
          locale={locale}
          loginHref={`/${locale}/login`}
          copy={dict.signupPage}
        />
    </div>
  );
}
