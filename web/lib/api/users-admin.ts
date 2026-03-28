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

/** Réponse API admin — jamais de mot de passe ni hash. */
export type AdminUserRole = {
  id: string;
  name: string;
  label?: string;
};

export type AdminUser = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  isActive: boolean;
  role?: AdminUserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUserDetail = AdminUser & {
  profile:
    | { type: "client"; preferences?: string }
    | { type: "prestataire"; raisonSociale?: string; siret?: string }
    | { type: "admin"; notes?: string }
    | null;
};

export type PaginatedUsers = {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

export type CreateAdminUserPayload = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: "admin" | "prestataire" | "client";
  telephone?: string;
  adresse?: string;
  isActive?: boolean;
};

export type UpdateAdminUserPayload = {
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  role?: "admin" | "prestataire" | "client";
  telephone?: string;
  adresse?: string;
};

/** GET /users — liste paginée (admin). */
export async function fetchAdminUsers(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedUsers> {
  const base = requireBase();
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("limit", String(Math.min(params?.limit ?? 50, 100)));
  const res = await fetch(`${base}/users?${search.toString()}`, {
    method: "GET",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  const text = await res.text();
  const body = text
    ? (JSON.parse(text) as PaginatedUsers)
    : { data: [], total: 0, page: 1, limit: 20 };
  return body;
}

/** GET /users/:id */
export async function fetchAdminUser(id: string): Promise<AdminUserDetail> {
  const base = requireBase();
  const res = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  return JSON.parse(await res.text()) as AdminUserDetail;
}

/** POST /users */
export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUserDetail> {
  const base = requireBase();
  const res = await fetch(`${base}/users`, {
    method: "POST",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  return JSON.parse(await res.text()) as AdminUserDetail;
}

/** PATCH /users/:id */
export async function updateAdminUser(
  id: string,
  payload: UpdateAdminUserPayload,
): Promise<AdminUserDetail> {
  const base = requireBase();
  const res = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  return JSON.parse(await res.text()) as AdminUserDetail;
}

/** PATCH /users/:id/status */
export async function patchAdminUserStatus(
  id: string,
  isActive: boolean,
): Promise<AdminUserDetail> {
  const base = requireBase();
  const res = await fetch(`${base}/users/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
  return JSON.parse(await res.text()) as AdminUserDetail;
}

/** DELETE /users/:id */
export async function deleteAdminUser(id: string): Promise<void> {
  const base = requireBase();
  const res = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersJsonAuth(),
  });
  if (!res.ok) throw new Error(await readBodyMessage(res));
}
