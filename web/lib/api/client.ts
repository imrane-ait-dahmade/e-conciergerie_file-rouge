/**
 * Utilitaires communs pour les appels fetch vers NestJS (même style que countries.ts).
 */
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";

export function requireApiBase(): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant. Ajoute l’URL du backend dans web/.env.local (ex. http://localhost:3000).",
    );
  }
  return base;
}

export async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) return `${res.status} ${res.statusText}`;
  try {
    const body = JSON.parse(text) as { message?: string | string[] };
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
  } catch {
    /* ignore */
  }
  return `${res.status} ${res.statusText}`;
}

export function headersJsonAuth(): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** GET (ou DELETE sans corps) avec seulement Bearer + Accept JSON. */
export function headersBearerAuth(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
