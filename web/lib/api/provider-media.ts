/**
 * Client prestataire pour `/media` (upload batch, liste, suppression).
 */
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import { readErrorMessage } from "@/lib/api/client";

export type ProviderMedia = {
  _id: string;
  url: string;
  type: "image" | "video";
  isPrimary?: boolean;
  mimeType?: string;
  originalFilename?: string;
  createdAt?: string;
};

function baseOrThrow(): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL manquant. Ajoute l’URL du backend dans web/.env.local.",
    );
  }
  return base.replace(/\/$/, "");
}

/** Bearer uniquement — pas de Content-Type pour FormData (boundary généré par le navigateur). */
function headersMultipartAuth(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function headersBearer(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function fetchProviderMediaList(params: {
  etablissementId?: string;
  etablissementServiceId?: string;
}): Promise<ProviderMedia[]> {
  const base = baseOrThrow();
  const q = new URLSearchParams();
  if (params.etablissementId) q.set("etablissementId", params.etablissementId);
  if (params.etablissementServiceId) {
    q.set("etablissementServiceId", params.etablissementServiceId);
  }
  const qs = q.toString();
  const res = await fetch(`${base}/media${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: headersBearer(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as ProviderMedia[]) : [];
}

export async function uploadProviderMediaBatch(
  files: File[],
  opts: {
    etablissementId?: string;
    etablissementServiceId?: string;
    isPrimary?: boolean;
  },
): Promise<ProviderMedia[]> {
  if (!files.length) {
    throw new Error("Aucun fichier à envoyer.");
  }
  const base = baseOrThrow();
  const form = new FormData();
  for (const f of files) {
    form.append("files", f);
  }
  if (opts.etablissementId) {
    form.append("etablissementId", opts.etablissementId);
  }
  if (opts.etablissementServiceId) {
    form.append("etablissementServiceId", opts.etablissementServiceId);
  }
  if (opts.isPrimary) {
    form.append("isPrimary", "true");
  }

  const res = await fetch(`${base}/media/upload/batch`, {
    method: "POST",
    headers: headersMultipartAuth(),
    body: form,
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as ProviderMedia[]) : [];
}

export async function deleteProviderMedia(id: string): Promise<void> {
  const base = baseOrThrow();
  const res = await fetch(`${base}/media/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headersBearer(),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}

/** PATCH /media/:id/primary — image uniquement côté API. */
export async function setProviderMediaPrimary(id: string): Promise<ProviderMedia> {
  const base = baseOrThrow();
  const res = await fetch(
    `${base}/media/${encodeURIComponent(id)}/primary`,
    {
      method: "PATCH",
      headers: headersBearer(),
    },
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<ProviderMedia>;
}
