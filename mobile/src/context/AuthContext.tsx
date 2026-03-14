import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loginRequest } from '@/src/services/api';
import { loadToken, saveToken } from '@/src/storage/authStorage';

type AuthContextValue = {
  /** Token JWT (null si non connecté) */
  token: string | null;
  /** Indique si on est encore en train de lire AsyncStorage au démarrage */
  isLoading: boolean;
  /** Connexion : POST /auth/login puis enregistrement du accessToken */
  signIn: (email: string, password: string) => Promise<void>;
  /**
   * Après POST /auth/signup le serveur renvoie déjà un accessToken :
   * on le sauvegarde comme après un login (pas besoin de re-saisir le mot de passe).
   */
  setAccessToken: (accessToken: string) => Promise<void>;
  /** Supprime le token (déconnexion) */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Fournit l’état d’authentification à tous les écrans (via useAuth).
 * Simple équivalent d’un Auth::user() / session, mais avec un JWT stocké sur l’appareil.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await loadToken();
        if (!cancelled) {
          setToken(stored);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { accessToken } = await loginRequest(email, password);
    await saveToken(accessToken);
    setToken(accessToken);
  }, []);

  const setAccessToken = useCallback(async (accessToken: string) => {
    await saveToken(accessToken);
    setToken(accessToken);
  }, []);

  const signOut = useCallback(async () => {
    await saveToken(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isLoading,
      signIn,
      setAccessToken,
      signOut,
    }),
    [token, isLoading, signIn, setAccessToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider');
  }
  return ctx;
}
