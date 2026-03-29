/**
 * Client HTTP minimal vers le backend NestJS (fetch).
 *
 * Variable d’environnement obligatoire côté navigateur :
 *   NEXT_PUBLIC_API_URL — ex. http://localhost:3001 (sans slash final)
 *
 * ---------------------------------------------------------------------------
 * Flux « connexion » (utilisé par login-form.tsx)
 * ---------------------------------------------------------------------------
 * 1. L’utilisateur envoie email + mot de passe.
 * 2. On appelle POST {NEXT_PUBLIC_API_URL}/auth/login avec un corps JSON.
 * 3. Si la réponse est OK : Nest renvoie { accessToken, refreshToken, user }.
 * 4. Le formulaire enregistre accessToken dans localStorage (auth-storage.ts)
 *    puis redirige (ex. vers le tableau de bord).
 * 5. Si erreur (401, 400, etc.) : on lit le message dans le JSON Nest
 *    (souvent { message: "..." }) et on l’affiche dans l’Alert.
 *
 * ---------------------------------------------------------------------------
 * Flux « inscription » (utilisé par signup-form.tsx)
 * ---------------------------------------------------------------------------
 * 1. On appelle POST /auth/signup avec { nom, prenom, email, password }.
 * 2. Si OK : le backend renvoie la même forme que le login (tokens + user).
 *    Le formulaire affiche un message de succès puis redirige vers /login
 *    (sans stocker le token — connexion explicite sur la page login).
 * ---------------------------------------------------------------------------
 */

import { clearAuthSession, getAccessToken } from "./auth-storage";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/** Chemins auth (préfixe global Nest : pas de /api ici sauf si tu en ajoutes un côté serveur). */
export const AUTH_PATHS = {
  login: "/auth/login",
  signup: "/auth/signup",
  logout: "/auth/logout",
} as const;

/** Corps attendu par POST /auth/login */
export type LoginData = {
  email: string;
  password: string;
};

/** Corps attendu par POST /auth/signup (SignupDto Nest) */
export type SignupData = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
};

/** Réponse renvoyée par le backend après login ou signup */
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
};

type NestErrorBody = {
  message?: string | string[];
  statusCode?: number;
};

export function getApiBaseUrl(): string {
  return API_BASE;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const msg = (body as NestErrorBody).message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg.join(", ");
  return fallback;
}

/**
 * POST JSON générique : lance une Error avec un message lisible si !res.ok.
 */
async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_URL est vide. Crée web/.env.local avec l’URL du backend (ex. http://localhost:3001).",
    );
  }

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await readJson(res);

  if (!res.ok) {
    throw new Error(
      errorMessage(data, `Erreur ${res.status} : ${res.statusText}`),
    );
  }

  return data as T;
}

function assertAuthResponse(data: unknown): AuthResponse {
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as AuthResponse).accessToken !== "string"
  ) {
    throw new Error("Réponse inattendue du serveur (pas de accessToken).");
  }
  return data as AuthResponse;
}

/** Connexion : POST /auth/login */
export async function login(data: LoginData): Promise<AuthResponse> {
  const raw = await postJson<unknown>(AUTH_PATHS.login, data);
  return assertAuthResponse(raw);
}

/** Inscription : POST /auth/signup */
export async function signup(data: SignupData): Promise<AuthResponse> {
  const raw = await postJson<unknown>(AUTH_PATHS.signup, data);
  return assertAuthResponse(raw);
}

/**
 * Déconnexion : POST /auth/logout (Bearer access token) puis suppression locale du jeton.
 * Si l’API échoue (réseau), le stockage local est quand même effacé.
 */
export async function logoutSession(): Promise<void> {
  const token = getAccessToken();
  if (API_BASE && token) {
    try {
      await fetch(`${API_BASE}${AUTH_PATHS.logout}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      /* hors ligne ou erreur réseau */
    }
  }
  clearAuthSession();
}
