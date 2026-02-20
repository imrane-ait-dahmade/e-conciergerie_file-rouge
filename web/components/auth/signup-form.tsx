"use client";

// Formulaire d’inscription : validation du couple mot de passe / confirmation côté navigateur avant l’API.
// Même langage visuel que la page de connexion (auth-card-shell, auth-form__*, bouton or).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
import { signup } from "@/lib/api";

type SignupFormProps = {
  locale: string;
  loginHref: string;
  /** Textes traduits (common.json → signupPage) */
  copy: CommonDictionary["signupPage"];
};

/**
 * Champs alignés sur le DTO Nest (nom, prénom, email, password).
 * confirmPassword n’est pas envoyé au serveur — uniquement vérifié ici.
 */
export function SignupForm({ locale, loginHref, copy }: SignupFormProps) {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Vérification front : les deux mots de passe doivent être identiques
    if (password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      // Même endpoint que le login côté Nest : réponse { accessToken, refreshToken, user }
      await signup({ nom, prenom, email, password });
      setSuccess(copy.successMessage);
      window.setTimeout(() => {
        router.push(loginHref);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.signupError);
    } finally {
      setLoading(false);
    }
  }

  const idNom = `signup-nom-${locale}`;
  const idPrenom = `signup-prenom-${locale}`;
  const idEmail = `signup-email-${locale}`;
  const idPassword = `signup-password-${locale}`;
  const idConfirm = `signup-confirm-${locale}`;
  const disabledFields = loading || !!success;

  return (
    <Card className="auth-card-shell auth-card-shell--wide">
      <CardHeader>
        <CardTitle className="auth-card__title">{copy.title}</CardTitle>
        <CardDescription className="auth-card__subtitle">{copy.description}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="auth-form__body">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" aria-hidden />
              <AlertTitle>{copy.errorTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert>
              <CheckCircle2 className="size-4 text-primary" aria-hidden />
              <AlertTitle>{copy.successTitle}</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : null}

          {/* Nom / prénom côte à côte sur écran large (voir .auth-form__grid dans _auth-theme.scss) */}
          <div className="auth-form__grid">
            <div className="auth-form__field">
              <Label htmlFor={idNom} className="auth-form__label">
                {copy.nomLabel}
              </Label>
              <Input
                id={idNom}
                name="nom"
                autoComplete="family-name"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                minLength={2}
                disabled={disabledFields}
                className="auth-form__input w-full"
              />
            </div>
            <div className="auth-form__field">
              <Label htmlFor={idPrenom} className="auth-form__label">
                {copy.prenomLabel}
              </Label>
              <Input
                id={idPrenom}
                name="prenom"
                autoComplete="given-name"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                minLength={2}
                disabled={disabledFields}
                className="auth-form__input w-full"
              />
            </div>
          </div>

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
              disabled={disabledFields}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={disabledFields}
              className="auth-form__input w-full"
            />
          </div>

          <div className="auth-form__field">
            <Label htmlFor={idConfirm} className="auth-form__label">
              {copy.confirmPasswordLabel}
            </Label>
            <Input
              id={idConfirm}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={disabledFields}
              className="auth-form__input w-full"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            disabled={disabledFields}
            className="auth-form__submit"
          >
            {loading ? copy.submitting : copy.submit}
          </Button>
          <p className="auth-form__meta">
            {copy.loginPrompt}{" "}
            <Link href={loginHref} className="auth-form__link">
              {copy.loginCta}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
