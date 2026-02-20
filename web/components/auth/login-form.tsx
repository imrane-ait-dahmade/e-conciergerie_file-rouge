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
import type { CommonDictionary } from "@/lib/get-dictionary";
import { login } from "@/lib/api";
import { saveAccessToken } from "@/lib/auth-storage";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ email, password });
      // Jeton JWT pour les prochains appels API (solution provisoire)
      saveAccessToken(data.accessToken);
      // Tableau de bord après connexion — remplace par `/${locale}` pour l’accueil
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  const idEmail = `login-email-${locale}`;
  const idPassword = `login-password-${locale}`;

  return (
    <Card className="auth-card-shell auth-card-shell--narrow">
      <CardHeader>
        <CardTitle className="auth-card__title">{copy.title}</CardTitle>
        <CardDescription className="auth-card__subtitle">{copy.description}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
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
        </CardContent>

        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
