/**
 * Stockage du jeton d’accès (temporaire : localStorage).
 * Plus tard : cookies httpOnly ou session côté serveur pour plus de sécurité.
 */
export const ACCESS_TOKEN_KEY = "accessToken";

export function saveAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
