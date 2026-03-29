/**
 * Assignations catalogue « établissement ↔ service » (JWT admin requis).
 */
import type { EtablissementServiceAssignment } from "@/lib/types/etablissement-service";

import { headersBearerAuth, headersJsonAuth, requireApiBase } from "./client";
import { throwIfNotOk } from "./read-json-error";

const PATH = "/etablissement-services";

export type EtablissementServicesListResponse = {
  data: EtablissementServiceAssignment[];
  total: number;
  page: number;
  limit: number;
};

export type CreateEtablissementServicePayload = {
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

export type UpdateEtablissementServicePayload = {
  prix?: number;
  commentaire?: string;
  adresse?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_label?: string;
  location_type?: string;
};

export async function fetchEtablissementServicesPage(params: {
  page?: number;
  limit?: number;
  etablissementId?: string;
}): Promise<EtablissementServicesListResponse> {
  const base = requireApiBase();
  const sp = new URLSearchParams();
  if (params.page != null && params.page > 0) sp.set("page", String(params.page));
  if (params.limit != null && params.limit > 0) sp.set("limit", String(params.limit));
  if (params.etablissementId) sp.set("etablissementId", params.etablissementId);
  const qs = sp.toString();
  const url = `${base}${PATH}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: headersBearerAuth(),
  });
  if (!res.ok) await throwIfNotOk(res);
  return (await res.json()) as EtablissementServicesListResponse;
}

/** Charge toutes les pages (limite API 100 / page) pour recherche et détection des doublons côté UI. */
export async function fetchAllEtablissementAssignments(): Promise<
  EtablissementServiceAssignment[]
> {
  const limit = 100;
  let page = 1;
  const acc: EtablissementServiceAssignment[] = [];
  let total = Infinity;

  while (acc.length < total) {
    const batch = await fetchEtablissementServicesPage({ page, limit });
    acc.push(...batch.data);
    total = batch.total;
    if (batch.data.length === 0) break;
    page += 1;
  }

  return acc;
}

export async function createEtablissementService(
  payload: CreateEtablissementServicePayload,
): Promise<EtablissementServiceAssignment> {
  const base = requireApiBase();
  const res = await fetch(`${base}${PATH}`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwIfNotOk(res);
  return (await res.json()) as EtablissementServiceAssignment;
}

export async function updateEtablissementService(
  id: string,
  payload: UpdateEtablissementServicePayload,
): Promise<EtablissementServiceAssignment> {
  const base = requireApiBase();
  const res = await fetch(`${base}${PATH}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwIfNotOk(res);
  return (await res.json()) as EtablissementServiceAssignment;
}

export async function deleteEtablissementService(id: string): Promise<void> {
  const base = requireApiBase();
  const res = await fetch(`${base}${PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersBearerAuth(),
  });
  if (!res.ok) await throwIfNotOk(res);
}
