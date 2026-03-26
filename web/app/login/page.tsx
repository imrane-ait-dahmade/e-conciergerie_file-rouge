import { LoginForm } from "@/components/auth/login-form";
import { getDictionary } from "@/lib/get-dictionary";
import { defaultLocale } from "@/lib/i18n-config";

/**
 * Page « /login » sans préfixe de langue (middleware applique la locale par défaut).
 */
export default async function LoginPage() {
  const dict = await getDictionary(defaultLocale);

  return (
    <div className="auth-page__inner">
      <LoginForm
          locale={defaultLocale}
          signupHref="/signup"
          copy={dict.loginPage}
        />
    </div>
  );
}
