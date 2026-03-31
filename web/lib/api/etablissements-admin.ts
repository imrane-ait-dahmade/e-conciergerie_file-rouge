import { getApiBaseUrl } from "@/lib/api";
import { ApiRequestError } from "@/lib/api/api-request-error";
import { readJsonErrorBody } from "@/lib/api/read-json-error";
import { getAccessToken } from "@/lib/auth-storage";

async function throwApiError(res: Response): Promise<never> {
  const { message, messages } = await readJsonErrorBody(res);
  throw new ApiRequestError(message, messages, res.status);
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

function requireBase(): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant dans .env.local (URL du backend Nest, ex. http://localhost:3000).",
    );
  }
  return base;
}

export type AdminEtablissementPrestataire = {
  _id?: string;
  nom?: string;
  prenom?: string;
  email?: string;
};

export type AdminEtablissementGeo = {
  _id?: string;
  nom?: string;
};

/** Document renvoyé par GET /admin/etablissements (peuplé). */
export type AdminEtablissement = {
  _id: string;
  nom: string;
  adresse?: string;
  /** Alias API de `adresse`. */
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location?: { type: "Point"; coordinates: [number, number] } | null;
  description?: string;
  telephone?: string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  prestataire?: AdminEtablissementPrestataire | string;
  ville?: AdminEtablissementGeo | string;
  quartier?: AdminEtablissementGeo | string;
};

export type PaginatedEtablissements = {
  data: AdminEtablissement[];
  total: number;
  page: number;
  limit: number;
};

export type CreateAdminEtablissementPayload = {
  nom: string;
  prestataire: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  telephone?: string;
  email?: string;
  ville?: string;
  quartier?: string;
  isActive?: boolean;
};

export type UpdateAdminEtablissementPayload = {
  nom?: string;
  prestataire?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  telephone?: string;
  email?: string;
  ville?: string;
  quartier?: string;
};

export function etablissementId(e: AdminEtablissement): string {
  return String(e._id);
}

export function prestataireLabel(e: AdminEtablissement): string {
  const p = e.prestataire;
  if (p && typeof p === "object") {
    const n = [p.prenom, p.nom].filter(Boolean).join(" ").trim();
    if (n) return n;
    if (p.email) return p.email;
  }
  return "—";
}

export function villeLabel(e: AdminEtablissement): string {
  const v = e.ville;
  if (v && typeof v === "object" && v.nom) return v.nom;
  return "—";
}

export function quartierLabel(e: AdminEtablissement): string {
  const q = e.quartier;
  if (q && typeof q === "object" && q.nom) return q.nom;
  return "—";
}

/** GET /admin/etablissements */
export async function fetchAdminEtablissements(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedEtablissements> {
  const base = requireBase();
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("limit", String(Math.min(params?.limit ?? 50, 100)));
  const res = await fetch(`${base}/admin/etablissements?${search.toString()}`, {
    method: "GET",
    headers: headersJsonAuth(),
  });
  if (!res.ok) await throwApiError(res);
  const text = await res.text();
  return text
    ? (JSON.parse(text) as PaginatedEtablissements)
    : { data: [], total: 0, page: 1, limit: 20 };
}

/** GET /admin/etablissements/:id */
export async function fetchAdminEtablissement(id: string): Promise<AdminEtablissement> {
  const base = requireBase();
  const res = await fetch(`${base}/admin/etablissements/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: headersJsonAuth(),
  });
  if (!res.ok) await throwApiError(res);
  return JSON.parse(await res.text()) as AdminEtablissement;
}

/** POST /admin/etablissements */
export async function createAdminEtablissement(
  payload: CreateAdminEtablissementPayload,
): Promise<AdminEtablissement> {
  const base = requireBase();
  const res = await fetch(`${base}/admin/etablissements`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwApiError(res);
  return JSON.parse(await res.text()) as AdminEtablissement;
}

/** PATCH /admin/etablissements/:id */
export async function updateAdminEtablissement(
  id: string,
  payload: UpdateAdminEtablissementPayload,
): Promise<AdminEtablissement> {
  const base = requireBase();
  const res = await fetch(`${base}/admin/etablissements/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwApiError(res);
  return JSON.parse(await res.text()) as AdminEtablissement;
}

/** PATCH /admin/etablissements/:id/status */
export async function patchAdminEtablissementStatus(
  id: string,
  isActive: boolean,
): Promise<AdminEtablissement> {
  const base = requireBase();
  const res = await fetch(`${base}/admin/etablissements/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) await throwApiError(res);
  return JSON.parse(await res.text()) as AdminEtablissement;
}

/** DELETE /admin/etablissements/:id */
export async function deleteAdminEtablissement(id: string): Promise<void> {
  const base = requireBase();
  const res = await fetch(`${base}/admin/etablissements/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) await throwApiError(res);
}
