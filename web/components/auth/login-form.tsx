"use client";

// Formulaire de connexion : état local + appel API + redirection.
// Style aligné sur la home : carte auth (auth-card-shell), champs auth-form__*, bouton or (auth-form__submit).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPostLoginHref } from "@/lib/auth-navigation";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { login } from "@/lib/api";
import { saveAccessToken } from "@/lib/auth-storage";
import { AppleIcon, GoogleIcon } from "@/components/auth/oauth-provider-icons";

type LoginFormProps = {
  locale: string;
  signupHref: string;
  /** Textes traduits (common.json → loginPage) */
  copy: CommonDictionary["loginPage"];
};

export function LoginForm({ locale, signupHref, copy }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function getOAuthUrl(provider: "google" | "apple"): string | undefined {
    const raw =
      provider === "google"
        ? process.env.NEXT_PUBLIC_OAUTH_GOOGLE_URL
        : process.env.NEXT_PUBLIC_OAUTH_APPLE_URL;
    return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : undefined;
  }

  function handleOAuth(provider: "google" | "apple") {
    setError(null);
    const url = getOAuthUrl(provider);
    if (url) {
      window.location.assign(url);
      return;
    }
    setError(copy.oauthUnavailable);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ email, password });
      // Jeton JWT pour les prochains appels API (solution provisoire)
      saveAccessToken(data.accessToken);
      // Tableau de bord (voir `lib/auth-navigation.ts` pour cibler `/admin` à la place)
      router.replace(getPostLoginHref(locale));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  const idEmail = `login-email-${locale}`;
  const idPassword = `login-password-${locale}`;

  return (
    <Card className="auth-card-shell auth-card-shell--narrow ring-0">
      <CardHeader>
        <CardTitle className="auth-card__title">{copy.title}</CardTitle>
        <CardDescription className="auth-card__subtitle">{copy.description}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate >
        <CardContent className="auth-form__body">
          {/* Erreur renvoyée par l’API (email / mot de passe, etc.) */}
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" aria-hidden />
              <AlertTitle>{copy.errorTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="auth-form__field">
            <Label htmlFor={idEmail} className="auth-form__label">
              {copy.emailLabel}
            </Label>
            <Input
              id={idEmail}
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="auth-form__input w-full"
            />
          </div>

          <div className="auth-form__field">
            <Label htmlFor={idPassword} className="auth-form__label">
              {copy.passwordLabel}
            </Label>
            <Input
              id={idPassword}
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="auth-form__input w-full"
            />
          </div>

          <div className="auth-form__oauth-wrap">
            <div className="auth-form__oauth-divider">
              <span className="auth-form__oauth-line" aria-hidden />
              <p className="auth-form__oauth-label">{copy.oauthContinueWith}</p>
              <span className="auth-form__oauth-line" aria-hidden />
            </div>
            <div
              className="auth-form__oauth"
              role="group"
              aria-label={copy.oauthContinueWith}
            >
              <button
                type="button"
                className="auth-form__oauth-btn"
                aria-label={copy.oauthGoogleAriaLabel}
                disabled={loading}
                onClick={() => handleOAuth("google")}
              >
                <GoogleIcon className="size-6" />
              </button>
              <button
                type="button"
                className="auth-form__oauth-btn"
                aria-label={copy.oauthAppleAriaLabel}
                disabled={loading}
                onClick={() => handleOAuth("apple")}
              >
                <AppleIcon className="size-6" />
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Bouton principal : même couleur accent que les CTA de la home (variables SCSS) */}
          <Button type="submit" disabled={loading} className="auth-form__submit">
            {loading ? copy.submitting : copy.submit}
          </Button>
          <p className="auth-form__meta">
            {copy.signupPrompt}{" "}
            <Link href={signupHref} className="auth-form__link">
              {copy.signupCta}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
