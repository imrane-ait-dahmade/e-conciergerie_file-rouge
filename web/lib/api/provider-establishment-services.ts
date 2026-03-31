/**
 * Client pour `/provider/establishment-services` (prestataire).
 */
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import { readErrorMessage } from "@/lib/api/client";
import { throwIfNotOk } from "@/lib/api/read-json-error";
import type { EtablissementServiceAssignment } from "@/lib/types/etablissement-service";

export type CreateProviderEtablissementServicePayload = {
  etablissement: string;
  service: string;
  prix?: number;
  commentaire?: string;
  adresse?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  location_label?: string;
  location_type?: string;
};

export type UpdateProviderEtablissementServicePayload = {
  prix?: number;
  commentaire?: string;
  adresse?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_label?: string;
  location_type?: string;
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

export async function fetchProviderEstablishmentServices(): Promise<
  EtablissementServiceAssignment[]
> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/provider/establishment-services`, {
    method: "GET",
    headers: headersJsonAuth(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as EtablissementServiceAssignment[]) : [];
}

export async function createProviderEstablishmentService(
  payload: CreateProviderEtablissementServicePayload,
): Promise<EtablissementServiceAssignment> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/provider/establishment-services`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwIfNotOk(res);
  return res.json() as Promise<EtablissementServiceAssignment>;
}

export async function updateProviderEstablishmentService(
  id: string,
  payload: UpdateProviderEtablissementServicePayload,
): Promise<EtablissementServiceAssignment> {
  const base = baseOrThrow();
  const res = await fetch(
    `${base}/provider/establishment-services/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: headersJsonAuth(),
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) await throwIfNotOk(res);
  return res.json() as Promise<EtablissementServiceAssignment>;
}

export async function deleteProviderEstablishmentService(id: string): Promise<void> {
  const base = baseOrThrow();
  const res = await fetch(
    `${base}/provider/establishment-services/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: headersJsonAuth(),
    },
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
