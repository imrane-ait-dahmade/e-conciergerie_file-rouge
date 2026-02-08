import type { Locale } from "./i18n-config";

/** Shared labels + flag emoji for the language switcher (reusable across UI). */
export const languageLabels: Record<
  Locale,
  { label: string; flag: string; short: string }
> = {
  fr: { label: "Français", flag: "🇫🇷", short: "FR" },
  en: { label: "English", flag: "🇬🇧", short: "EN" },
  ar: { label: "العربية", flag: "🇲🇦", short: "AR" },
};
