import { getAccessToken } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api";

export type DistrictPayload = {
  nom: string;
  ville: string;
};

/** Quartier renvoyé par GET /districts (ville + pays peuplés). */
export type DistrictListItem = {
  _id: string;
  nom: string;
  ville?:
    | string
    | {
        _id?: string;
        id?: string;
        nom?: string;
        pays?: { nom?: string; code?: string } | string;
      };
};

export type PaginatedDistricts = {
  data: DistrictListItem[];
  total: number;
  page: number;
  limit: number;
};

export type DistrictTableRow = {
  id: string;
  nom: string;
  ville: string;
  pays: string;
  cityId: string;
};

export function mapDistrictToTableRow(d: DistrictListItem): DistrictTableRow {
  const v = d.ville;
  if (v && typeof v === "object") {
    const cityId = String(v._id ?? v.id ?? "");
    const ville = v.nom ?? "—";
    let pays = "—";
    const p = v.pays;
    if (p && typeof p === "object" && p !== null && "nom" in p) {
      pays = String((p as { nom?: string }).nom ?? "—");
    } else if (typeof p === "string" && p) pays = p;
    return { id: d._id, nom: d.nom, ville, pays, cityId };
  }
  return {
    id: d._id,
    nom: d.nom,
    ville: "—",
    pays: "—",
    cityId: typeof v === "string" ? v : "",
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

/** GET /districts (paginé ; filtre optionnel cityId). */
export async function fetchDistricts(params?: {
  page?: number;
  limit?: number;
  cityId?: string;
}): Promise<PaginatedDistricts> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("limit", String(Math.min(params?.limit ?? 100, 100)));
  if (params?.cityId) search.set("cityId", params.cityId);
  const res = await fetch(`${base}/districts?${search.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  const body = text ? (JSON.parse(text) as PaginatedDistricts) : { data: [], total: 0, page: 1, limit: 20 };
  return body;
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

/** POST /districts */
export async function createDistrict(payload: DistrictPayload): Promise<unknown> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/districts`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** PATCH /districts/:id */
export async function updateDistrict(id: string, payload: Partial<DistrictPayload>): Promise<unknown> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/districts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** DELETE /districts/:id */
export async function deleteDistrict(id: string): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  const res = await fetch(`${base}/districts/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
}
