/**
 * Client pour `/provider/etablissements` (prestataire connecté uniquement).
 */
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import { readErrorMessage } from "@/lib/api/client";
import { throwIfNotOk } from "@/lib/api/read-json-error";

export type ProviderEtablissementGeo = { _id: string; nom?: string };

/** Réponse API (léger ; pas de données admin / autres prestataires). */
export type ProviderEtablissement = {
  _id: string;
  nom: string;
  adresse?: string;
  /** Alias API (`withEtablissementLocationApiFields`). */
  address?: string | null;
  description?: string;
  telephone?: string;
  email?: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  ville?: string | ProviderEtablissementGeo | null;
  quartier?: string | ProviderEtablissementGeo | null;
};

export type ProviderCreateEtablissementPayload = {
  nom: string;
  adresse?: string;
  description?: string;
  telephone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  ville?: string;
  quartier?: string;
  isActive?: boolean;
};

export type ProviderUpdateEtablissementPayload = {
  nom?: string;
  adresse?: string;
  description?: string;
  telephone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  ville?: string;
  quartier?: string;
};

function headersJsonAuth(): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function baseOrThrow(): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant. Ajoute l’URL du backend dans web/.env.local.",
    );
  }
  return base.replace(/\/$/, "");
}

export async function fetchProviderEtablissements(): Promise<ProviderEtablissement[]> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/provider/etablissements`, {
    method: "GET",
    headers: headersJsonAuth(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as ProviderEtablissement[]) : [];
}

export async function fetchProviderEtablissement(id: string): Promise<ProviderEtablissement> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/provider/etablissements/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: headersJsonAuth(),
    cache: "no-store",
  });
  if (!res.ok) await throwIfNotOk(res);
  return res.json() as Promise<ProviderEtablissement>;
}

export async function createProviderEtablissement(
  payload: ProviderCreateEtablissementPayload,
): Promise<ProviderEtablissement> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/provider/etablissements`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwIfNotOk(res);
  return res.json() as Promise<ProviderEtablissement>;
}

export async function updateProviderEtablissement(
  id: string,
  payload: ProviderUpdateEtablissementPayload,
): Promise<ProviderEtablissement> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/provider/etablissements/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwIfNotOk(res);
  return res.json() as Promise<ProviderEtablissement>;
}

export async function patchProviderEtablissementStatus(
  id: string,
  isActive: boolean,
): Promise<ProviderEtablissement> {
  const base = baseOrThrow();
  const res = await fetch(
    `${base}/provider/etablissements/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: headersJsonAuth(),
      body: JSON.stringify({ isActive }),
    },
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<ProviderEtablissement>;
}
