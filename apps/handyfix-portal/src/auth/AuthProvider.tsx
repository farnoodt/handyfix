import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, me as apiMe, type AuthResponse } from "@handyfix/api-client";

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

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "handyfix_token";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        if (!token) {
          if (!cancelled) setUser(null);
          return;
        }

        const u: any = await apiMe();
        if (cancelled) return;

        setUser({
          email: u?.email ?? u?.user?.email ?? "unknown",
          fullName: u?.fullName ?? u?.user?.fullName ?? null,
          roles: u?.roles ?? u?.user?.roles ?? [],
        });
      } catch {
        // token invalid
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email: string, password: string) {
    const res: AuthResponse = await apiLogin({ email, password });

    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token); // ✅ triggers rerender everywhere

    setUser({
      email: res.email,
      fullName: res.fullName,
      roles: res.roles,
    });
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);  // ✅ triggers rerender everywhere
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
