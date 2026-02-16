"use client";

// Sélecteur de langue : drapeau + menu déroulant (balise <details> native, sans dépendance lourde).

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { languageLabels } from "@/lib/language-meta";
import { isLocale, locales, type Locale } from "@/lib/i18n-config";

/** Construit le chemin équivalent pour une autre locale (avec ou sans préfixe /fr, /en…). */
function hrefForLocale(pathname: string, loc: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${loc}`;
  if (isLocale(segments[0])) {
    segments[0] = loc;
    return `/${segments.join("/")}`;
  }
  return `/${loc}${pathname === "/" ? "" : pathname}`;
}

type LanguageSwitcherProps = {
  locale: Locale;
  className?: string;
};

export function LanguageSwitcher({ locale, className }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? "/";

  return (
    <details
      className={cn(
        "group relative z-20",
        "[&_summary::-webkit-details-marker]:hidden [&_summary::marker]:content-none",
        className
      )}
    >
      <summary
        className={cn(
          "ec-header__lang",
          "flex cursor-pointer list-none items-center justify-center rounded-md transition-opacity",
          "hover:opacity-90",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-[var(--ds-brand-primary,#1e3a8a)]"
        )}
        aria-label={`Choisir la langue — ${languageLabels[locale].label}`}
        aria-haspopup="listbox"
      >
        <span className="ec-header__lang-flag" aria-hidden>
          {languageLabels[locale].flag}
        </span>
      </summary>

      {/* Liste des langues : fond carte + bordure douce (tokens design system) */}
      <ul
        className={cn(
          "absolute end-0 top-[calc(100%+0.35rem)] min-w-[10.5rem] rounded-lg border py-1 shadow-md",
          "border-[var(--ds-border-default,#e2e8f0)] bg-[var(--ds-background-card,#fff)]"
        )}
        role="listbox"
      >
        {locales.map((loc) => (
          <li key={loc} role="option" aria-selected={loc === locale}>
            <Link
              href={hrefForLocale(pathname, loc)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                "hover:bg-[var(--ds-background-muted,#f1f5f9)]",
                loc === locale && "bg-[var(--ds-background-muted,#f1f5f9)] font-medium"
              )}
              hrefLang={loc}
            >
              <span aria-hidden>{languageLabels[loc].flag}</span>
              <span>{languageLabels[loc].label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
