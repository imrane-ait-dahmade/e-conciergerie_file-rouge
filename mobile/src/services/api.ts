import { API_BASE_URL } from '@/src/constants/config';

/**
 * Représente une erreur renvoyée par NestJS (ValidationPipe, exceptions HTTP, etc.).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type NestErrorBody = {
  message?: string | string[];
  statusCode?: number;
};

/**
 * Extrait un message lisible depuis la réponse JSON de l’API.
 */
function messageFromBody(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Une erreur est survenue';
  }
  const b = data as NestErrorBody;
  const m = b.message;
  if (typeof m === 'string') {
    return m;
  }
  if (Array.isArray(m)) {
    return m.join(', ');
  }
  return 'Une erreur est survenue';
}

/**
 * Appel HTTP générique vers le backend NestJS.
 * @param path — chemin après l’URL de base (ex. "/auth/login")
 * @param options — options fetch classiques ; on ajoute JSON + Bearer si besoin
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const mergedHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers,
  };

  // Nos requêtes POST envoient du JSON (chaîne déjà stringifiée)
  if (rest.body !== undefined && !(mergedHeaders as Record<string, string>)['Content-Type']) {
    (mergedHeaders as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (mergedHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...rest,
    headers: mergedHeaders,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(messageFromBody(data), res.status);
  }

  return data as T;
}

export type SafeUserResponse = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  isActive: boolean;
};

/**
 * Réponse commune de POST /auth/login et POST /auth/signup (NestJS AuthService).
 * On utilise surtout accessToken pour les requêtes suivantes.
 */
export type AuthLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: SafeUserResponse;
};

/** POST /auth/login — corps { email, password } */
export async function loginRequest(email: string, password: string): Promise<AuthLoginResponse> {
  return apiFetch<AuthLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** Corps aligné sur SignupDto côté NestJS */
export type SignupBody = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
};

/** POST /auth/signup — renvoie aussi les tokens (connexion automatique côté serveur) */
export async function signupRequest(body: SignupBody): Promise<AuthLoginResponse> {
  return apiFetch<AuthLoginResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getProfile(token: string): Promise<SafeUserResponse> {
  return apiFetch<SafeUserResponse>('/users/profile', {
    method: 'GET',
    token,
  });
}

/** Document Mongoose sérialisé en JSON (champ _id) */
export type EtablissementApi = {
  _id: string;
  nom: string;
  adresse?: string;
  description?: string;
  telephone?: string;
  email?: string;
  image?: string;
};

export async function getEtablissements(): Promise<EtablissementApi[]> {
  return apiFetch<EtablissementApi[]>('/etablissements', { method: 'GET' });
}

export async function getEtablissementById(id: string): Promise<EtablissementApi> {
  return apiFetch<EtablissementApi>(`/etablissements/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}
