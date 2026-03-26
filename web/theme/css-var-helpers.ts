import type { ThemeMode } from "@/theme/types";

/**
 * Lit une variable CSS sur le document (utile pour canvas, graphiques, librairies non thémables).
 * Côté serveur : chaîne vide.
 */
export function readCssVar(name: string, root: HTMLElement | null = null): string {
  if (typeof window === "undefined") return "";
  const el = root ?? document.documentElement;
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/**
 * Déduit le mode depuis `<html class="light | dark">` (à utiliser avec un `useEffect` + listener si besoin).
 */
export function getThemeModeFromDocument(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
