import type { ServiceDoc } from "@/lib/types/catalog";

import { headersJsonAuth, readErrorMessage, requireApiBase } from "./client";

export type CreateServicePayload = {
  nom: string;
  description?: string;
  domaine: string;
};

export async function fetchServices(): Promise<ServiceDoc[]> {
  const base = requireApiBase();
  const res = await fetch(`${base}/services`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as ServiceDoc[]) : [];
}

export async function fetchServiceById(id: string): Promise<ServiceDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/services/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ServiceDoc;
}

export async function createService(
  payload: CreateServicePayload,
): Promise<ServiceDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/services`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ServiceDoc;
}

export async function updateService(
  id: string,
  payload: Partial<CreateServicePayload>,
): Promise<ServiceDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as ServiceDoc;
}

export async function deleteService(id: string): Promise<void> {
  const base = requireApiBase();
  const res = await fetch(`${base}/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
