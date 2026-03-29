import { getApiBaseUrl } from "@/lib/api";

/** Réponse GET /countries/:id/media/primary ou /cities/:id/media/primary (ou `null`). */
export type GeoPrimaryImage = {
  id: string;
  url: string;
  isPrimary: boolean;
  mimeType?: string;
  createdAt?: string;
} | null;

async function getJson<T>(pathFromBase: string): Promise<T | null> {
  const base = getApiBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}${pathFromBase}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCountryPrimaryImage(
  countryId: string,
): Promise<GeoPrimaryImage> {
  const data = await getJson<GeoPrimaryImage>(
    `/countries/${encodeURIComponent(countryId)}/media/primary`,
  );
  if (!data?.url) return null;
  return data;
}

export async function fetchCityPrimaryImage(
  cityId: string,
): Promise<GeoPrimaryImage> {
  const data = await getJson<GeoPrimaryImage>(
    `/cities/${encodeURIComponent(cityId)}/media/primary`,
  );
  if (!data?.url) return null;
  return data;
}
