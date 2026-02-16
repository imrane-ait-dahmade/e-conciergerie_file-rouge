// En-tête du site : marque à gauche, langue, connexion (lien bleu), inscription (CTA or).
// La mise en forme principale vient des classes SCSS `ec-header__*` (styles/_home.scss).
// Variantes de classes depuis `button-variants.ts` (sans "use client") pour compatibilité Server Component.

import Link from "next/link";
import { MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";
import type { CommonDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

type HeaderProps = {
  locale: string;
  /** Textes depuis getDictionary (comme les fichiers lang Laravel) */
  dict: Pick<CommonDictionary, "brand" | "login" | "register">;
};

export function Header({ locale, dict }: HeaderProps) {
  const loginHref = `/${locale}/login`;
  const signupHref = `/${locale}/signup`;
  const currentLocale = locale as Locale;

  return (
    <header className="ec-header">
      <div className="ec-header__inner">
        {/* Zone marque : icône + nom (lien vers l’accueil localisé) */}
        <Link href={`/${locale}`} className="ec-header__brand">
          <MapPin
            className="size-6 shrink-0 text-[var(--ds-brand-primary,var(--primary))]"
            aria-hidden
          />
          <span className="ec-header__brand-text max-sm:text-lg">{dict.brand}</span>
        </Link>

        <div className="ec-header__actions flex-wrap justify-end sm:flex-nowrap">
          {/* Langue : composant client (pathname → liens /fr, /en, /ar…) */}
          <LanguageSwitcher locale={currentLocale} />

          {/* Connexion : variante « link » shadcn + classes maquette (bleu gras) */}
          <Link
            href={loginHref}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "ec-header__link-login h-auto min-h-8 px-2 py-2 font-bold",
              "text-[var(--ds-brand-primary)] no-underline hover:underline"
            )}
          >
            {dict.login}
          </Link>

          {/* Inscription : CTA or — classes SCSS + surcharge tokens pour coller à Figma */}
          <Link
            href={signupHref}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "ec-header__cta min-h-8 min-w-[7rem] rounded-[7px] border-0 px-3 font-bold",
              "bg-[var(--ds-accent)] !text-[var(--ds-text-on-accent)] shadow-sm",
              "hover:bg-[var(--ds-accent-hover)] hover:!text-[var(--ds-text-on-accent)]",
              "focus-visible:ring-2 focus-visible:ring-[var(--ds-brand-primary)]/35"
            )}
          >
            {dict.register}
          </Link>
        </div>
      </div>
    </header>
  );
}
