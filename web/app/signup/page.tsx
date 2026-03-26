import { SignupForm } from "@/components/auth/signup-form";
import { getDictionary } from "@/lib/get-dictionary";
import { defaultLocale } from "@/lib/i18n-config";

/**
 * Page « /signup » sans préfixe de langue (middleware applique la locale par défaut).
 */
export default async function SignupPage() {
  const dict = await getDictionary(defaultLocale);

  return (
    <div className="auth-page__inner auth-page__inner--wide">
      <SignupForm
          locale={defaultLocale}
          loginHref="/login"
          copy={dict.signupPage}
        />
    </div>
  );
}
