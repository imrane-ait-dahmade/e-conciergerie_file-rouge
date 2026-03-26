"use client";

// Inscription en wizard (étapes) : identité → email → mots de passe + soumission API.
// Composants shadcn : Card, Badge, Progress, Separator, Button, Alert, Input, Label.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import { AppleIcon, GoogleIcon } from "@/components/auth/oauth-provider-icons";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { signup } from "@/lib/api";

const TOTAL_STEPS = 3;

function formatWizardProgress(template: string, current: number, total: number) {
  return template.replace("{current}", String(current)).replace("{total}", String(total));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupFormProps = {
  locale: string;
  loginHref: string;
  copy: CommonDictionary["signupPage"];
};

export function SignupForm({ locale, loginHref, copy }: SignupFormProps) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stepLabels = [
    copy.wizardStepIdentity,
    copy.wizardStepEmail,
    copy.wizardStepPassword,
  ];

  function getOAuthUrl(provider: "google" | "apple"): string | undefined {
    const raw =
      provider === "google"
        ? process.env.NEXT_PUBLIC_OAUTH_GOOGLE_URL
        : process.env.NEXT_PUBLIC_OAUTH_APPLE_URL;
    return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : undefined;
  }

  function handleOAuth(provider: "google" | "apple") {
    if (loading || success) return;
    setError(null);
    setSuccess(null);
    const url = getOAuthUrl(provider);
    if (url) {
      window.location.assign(url);
      return;
    }
    setError(copy.oauthUnavailable);
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    setError(null);
    if (step === 0) {
      if (nom.trim().length < 2 || prenom.trim().length < 2) {
        setError(copy.wizardIdentityInvalid);
        return;
      }
    }
    if (step === 1) {
      if (!EMAIL_RE.test(email.trim())) {
        setError(copy.wizardEmailInvalid);
        return;
      }
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }

  async function submitSignup() {
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
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

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step !== TOTAL_STEPS - 1) return;
    void submitSignup();
  }

  const idNom = `signup-nom-${locale}`;
  const idPrenom = `signup-prenom-${locale}`;
  const idEmail = `signup-email-${locale}`;
  const idPassword = `signup-password-${locale}`;
  const idConfirm = `signup-confirm-${locale}`;
  const disabledFields = loading || !!success;
  const progressValue = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  return (
    <Card className="auth-card-shell auth-card-shell--wide ring-0">
      <CardHeader>
        <CardTitle className="auth-card__title">{copy.title}</CardTitle>
        {!success ? (
          <>
            <CardDescription className="auth-card__subtitle">
              {copy.description}
            </CardDescription>
            <div className="mt-4 space-y-3">
              <p className="text-xs font-medium text-foreground">
                {formatWizardProgress(copy.wizardProgress, step + 1, TOTAL_STEPS)}
              </p>
              <Progress value={progressValue} />
              <div className="flex flex-wrap gap-2" role="list" aria-label={copy.wizardProgress}>
                {stepLabels.map((label, i) => (
                  <Badge
                    key={label}
                    role="listitem"
                    variant={i === step ? "default" : i < step ? "secondary" : "outline"}
                  >
                    {i + 1}. {label}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </CardHeader>

      <form onSubmit={handleFormSubmit} noValidate>
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

          {!success && step === 0 ? (
            <>
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
                    disabled={disabledFields}
                    onClick={() => handleOAuth("google")}
                  >
                    <GoogleIcon className="size-6" />
                  </button>
                  <button
                    type="button"
                    className="auth-form__oauth-btn"
                    aria-label={copy.oauthAppleAriaLabel}
                    disabled={disabledFields}
                    onClick={() => handleOAuth("apple")}
                  >
                    <AppleIcon className="size-6" />
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {!success && step === 1 ? (
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
          ) : null}

          {!success && step === 2 ? (
            <>
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
            </>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {!success ? (
            <>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabledFields}
                    onClick={goBack}
                    className="w-full sm:w-auto"
                  >
                    {copy.wizardBack}
                  </Button>
                ) : null}
                {step < TOTAL_STEPS - 1 ? (
                  <Button
                    type="button"
                    disabled={disabledFields}
                    onClick={goNext}
                    className="auth-form__submit w-full sm:min-w-[10rem]"
                  >
                    {copy.wizardNext}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={disabledFields}
                    className="auth-form__submit w-full sm:min-w-[10rem]"
                  >
                    {loading ? copy.submitting : copy.submit}
                  </Button>
                )}
              </div>
            </>
          ) : null}
          <p className={`auth-form__meta ${success ? "w-full text-center" : ""}`}>
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
