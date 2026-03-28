import type { CaracteristiqueDoc } from "@/lib/types/catalog";

import { headersJsonAuth, readErrorMessage, requireApiBase } from "./client";

export type CreateCaracteristiquePayload = {
  libelle: string;
  service?: string;
};

export async function fetchCaracteristiques(): Promise<CaracteristiqueDoc[]> {
  const base = requireApiBase();
  const res = await fetch(`${base}/caracteristiques`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as CaracteristiqueDoc[]) : [];
}

export async function fetchCaracteristiqueById(
  id: string,
): Promise<CaracteristiqueDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/caracteristiques/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as CaracteristiqueDoc;
}

export async function createCaracteristique(
  payload: CreateCaracteristiquePayload,
): Promise<CaracteristiqueDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/caracteristiques`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as CaracteristiqueDoc;
}

export async function updateCaracteristique(
  id: string,
  payload: Partial<CreateCaracteristiquePayload>,
): Promise<CaracteristiqueDoc> {
  const base = requireApiBase();
  const res = await fetch(`${base}/caracteristiques/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as CaracteristiqueDoc;
}

export async function deleteCaracteristique(id: string): Promise<void> {
  const base = requireApiBase();
  const res = await fetch(`${base}/caracteristiques/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
