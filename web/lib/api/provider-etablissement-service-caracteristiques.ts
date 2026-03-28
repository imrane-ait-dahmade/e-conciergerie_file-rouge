/**
 * Client prestataire pour les caractéristiques d’offre (ESC).
 *
 * - Liste / création : `/provider/establishment-services/:esId/caracteristiques`
 * - Màj / suppression : `/provider/establishment-service-caracteristiques/:id`
 */
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import { readErrorMessage } from "@/lib/api/client";
import type { EtablissementServiceCaracteristiqueDoc } from "@/lib/types/etablissement-service-caracteristique";

export type CreateProviderEscPayload =
  | { valeur: string; caracteristiqueCatalogId: string }
  | { valeur: string; libelle: string };

export type UpdateProviderEscPayload = {
  libelle?: string;
  valeur?: string;
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

export async function fetchProviderEscForEstablishmentService(
  establishmentServiceId: string,
): Promise<EtablissementServiceCaracteristiqueDoc[]> {
  const base = baseOrThrow();
  const res = await fetch(
    `${base}/provider/establishment-services/${encodeURIComponent(establishmentServiceId)}/caracteristiques`,
    { method: "GET", headers: headersJsonAuth(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as EtablissementServiceCaracteristiqueDoc[]) : [];
}

export async function createProviderEsc(
  establishmentServiceId: string,
  payload: CreateProviderEscPayload,
): Promise<EtablissementServiceCaracteristiqueDoc> {
  const base = baseOrThrow();
  const res = await fetch(
    `${base}/provider/establishment-services/${encodeURIComponent(establishmentServiceId)}/caracteristiques`,
    { method: "POST", headers: headersJsonAuth(), body: JSON.stringify(payload) },
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<EtablissementServiceCaracteristiqueDoc>;
}

export async function updateProviderEsc(
  id: string,
  payload: UpdateProviderEscPayload,
): Promise<EtablissementServiceCaracteristiqueDoc> {
  const base = baseOrThrow();
  const res = await fetch(
    `${base}/provider/establishment-service-caracteristiques/${encodeURIComponent(id)}`,
    { method: "PATCH", headers: headersJsonAuth(), body: JSON.stringify(payload) },
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<EtablissementServiceCaracteristiqueDoc>;
}

export async function deleteProviderEsc(id: string): Promise<void> {
  const base = baseOrThrow();
  const res = await fetch(
    `${base}/provider/establishment-service-caracteristiques/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: headersJsonAuth() },
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
