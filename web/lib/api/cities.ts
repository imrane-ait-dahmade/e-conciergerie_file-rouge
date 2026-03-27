import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api";

export type CityPayload = {
  nom: string;
  pays: string;
};

/** Ville renvoyée par GET /cities (souvent avec `pays` peuplé). */
export type CityListItem = {
  _id: string;
  nom: string;
  pays?: { _id?: string; id?: string; nom?: string; code?: string } | string;
};

export type PaginatedCities = {
  data: CityListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CityTableRow = {
  id: string;
  nom: string;
  pays: string;
  countryId: string;
};

export function mapCityToTableRow(c: CityListItem): CityTableRow {
  const p = c.pays;
  if (p && typeof p === "object" && p !== null) {
    const countryId = String(p._id ?? p.id ?? "");
    const pays = p.nom ?? "—";
    return { id: c._id, nom: c.nom, pays, countryId };
  }
  return {
    id: c._id,
    nom: c.nom,
    pays: "—",
    countryId: typeof p === "string" ? p : "",
  };
}

async function readBodyMessage(res: Response): Promise<string> {
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

function headersJsonAuth(): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** GET /cities (paginé ; filtre optionnel countryId). */
export async function fetchCities(params?: {
  page?: number;
  limit?: number;
  countryId?: string;
}): Promise<PaginatedCities> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("limit", String(Math.min(params?.limit ?? 100, 100)));
  if (params?.countryId) search.set("countryId", params.countryId);
  const res = await fetch(`${base}/cities?${search.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  const body = text ? (JSON.parse(text) as PaginatedCities) : { data: [], total: 0, page: 1, limit: 20 };
  return body;
}

/** POST /cities */
export async function createCity(payload: CityPayload): Promise<unknown> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/cities`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** PATCH /cities/:id */
export async function updateCity(id: string, payload: Partial<CityPayload>): Promise<unknown> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/cities/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** DELETE /cities/:id */
export async function deleteCity(id: string): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/cities/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
}
