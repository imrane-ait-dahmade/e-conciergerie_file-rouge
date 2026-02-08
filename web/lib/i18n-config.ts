/** Request header set by middleware so the root layout can set <html lang> / dir. */
export const LOCALE_HEADER = "x-locale";

export const locales = ["fr", "en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
