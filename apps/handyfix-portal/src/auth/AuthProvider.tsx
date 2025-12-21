import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  me as apiMe,
  setAccessToken,
  type AuthResponse,
} from "@handyfix/api-client";

type AuthUser = {
  email: string;
  fullName: string | null;
  roles: string[];
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthed: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? "handyfix_token";

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(u: any): AuthUser {
  return {
    email: u?.email ?? u?.user?.email ?? "unknown",
    fullName: u?.fullName ?? u?.user?.fullName ?? null,
    roles: u?.roles ?? u?.user?.roles ?? [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Sync token into api-client whenever it changes (including first load)
  useEffect(() => {
    setAccessToken(token);
  }, [token]);

  // Rehydrate session when token changes
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      setLoading(true);

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const me = await apiMe();
        if (cancelled) return;
        setUser(normalizeUser(me));
      } catch {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {}

        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res: AuthResponse = await apiLogin({ email, password });

      try {
        localStorage.setItem(TOKEN_KEY, res.token);
      } catch {}

      setToken(res.token);
      setUser({
        email: res.email,
        fullName: res.fullName,
        roles: res.roles,
      });
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthed: !!token,
      loading,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
