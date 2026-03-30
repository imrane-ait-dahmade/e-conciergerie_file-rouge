import type { DomaineDoc } from "@/lib/types/catalog";

import { headersJsonAuth, readErrorMessage, requireApiBase } from "./client";

export type CreateDomainePayload = {
  nom: string;
  description?: string;
  icon?: string;
};

export async function fetchDomaines(): Promise<DomaineDoc[]> {
  const base = requireApiBase();
  const res = await fetch(`${base}/domaines`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as DomaineDoc[]) : [];
}

export async function fetchDomaineById(id: string): Promise<DomaineDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/domaines/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as DomaineDoc;
}

export async function createDomaine(
  payload: CreateDomainePayload,
): Promise<DomaineDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/domaines`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as DomaineDoc;
}

export async function updateDomaine(
  id: string,
  payload: Partial<CreateDomainePayload>,
): Promise<DomaineDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/domaines/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as DomaineDoc;
}

export async function deleteDomaine(id: string): Promise<void> {
  const base = requireApiBase();
  const res = await fetch(`${base}/domaines/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
