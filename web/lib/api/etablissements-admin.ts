import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";

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
  if (!res.ok) throw new Error(await readBodyMessage(res));
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
  if (!res.ok) throw new Error(await readBodyMessage(res));
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
  if (!res.ok) throw new Error(await readBodyMessage(res));
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
  if (!res.ok) throw new Error(await readBodyMessage(res));
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
  if (!res.ok) throw new Error(await readBodyMessage(res));
  return JSON.parse(await res.text()) as AdminEtablissement;
}

/** DELETE /admin/etablissements/:id */
export async function deleteAdminEtablissement(id: string): Promise<void> {
  const base = requireBase();
  const res = await fetch(`${base}/admin/etablissements/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
}
