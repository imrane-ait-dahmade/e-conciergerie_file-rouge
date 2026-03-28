/**
 * Profil utilisateur connecté : GET/PATCH `/users/profile`.
 */
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import { readErrorMessage } from "@/lib/api/client";
import type { UserProfile } from "@/lib/types/user-profile";

export type UpdateUserProfilePayload = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
};

function headersJsonAuth(): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function baseOrThrow(): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant. Ajoute l’URL du backend dans web/.env.local.",
    );
  }
  return base.replace(/\/$/, "");
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/users/profile`, {
    method: "GET",
    headers: headersJsonAuth(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<UserProfile>;
}

export async function updateUserProfile(
  payload: UpdateUserProfilePayload,
): Promise<UserProfile> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/users/profile`, {
    method: "PATCH",
    headers: headersJsonAuth(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<UserProfile>;
}
