import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api";

export type CountryPayload = {
  nom: string;
  code?: string;
};

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

export type CountryListItem = {
  _id: string;
  nom: string;
  code?: string;
};

export type PaginatedCountries = {
  data: CountryListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CountryTableRow = {
  id: string;
  nom: string;
  code: string;
};

export function mapCountryToTableRow(c: CountryListItem): CountryTableRow {
  return { id: c._id, nom: c.nom, code: c.code ?? "" };
}

/** GET /countries (liste paginée ; lecture souvent sans JWT). */
export async function fetchCountries(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedCountries> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("limit", String(Math.min(params?.limit ?? 100, 100)));
  const res = await fetch(`${base}/countries?${search.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  const body = text ? (JSON.parse(text) as PaginatedCountries) : { data: [], total: 0, page: 1, limit: 20 };
  return body;
}

/** POST /countries */
export async function createCountry(payload: CountryPayload): Promise<unknown> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/countries`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** PATCH /countries/:id */
export async function updateCountry(id: string, payload: Partial<CountryPayload>): Promise<unknown> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/countries/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** DELETE /countries/:id */
export async function deleteCountry(id: string): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/countries/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
}
