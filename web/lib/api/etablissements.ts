import type { EtablissementListItem } from "@/lib/types/catalog";

import { readErrorMessage, requireApiBase } from "./client";

/** GET /etablissements — liste publique. */
export async function fetchEtablissements(): Promise<EtablissementListItem[]> {
  const base = requireApiBase();
  const res = await fetch(`${base}/etablissements`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as EtablissementListItem[]) : [];
}
