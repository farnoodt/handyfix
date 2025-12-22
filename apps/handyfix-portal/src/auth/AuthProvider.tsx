import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  me as apiMe,
  setAccessToken,
  setUnauthorizedHandler,
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

  hasRole: (role: string) => boolean;
  isAdmin: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? "handyfix_token";

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(meResult: any): AuthUser {
  // Your API returns ApiResponse.Success(new { ... })
  // so meResult can be either { id,email,fullName,Roles } OR { user: {...} } depending on wrappers.
  const obj = meResult?.user ?? meResult ?? {};

  return {
    email: obj?.email ?? obj?.Email ?? "unknown",
    fullName: obj?.fullName ?? obj?.FullName ?? null,
    roles: obj?.roles ?? obj?.Roles ?? [],
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

  // Role helpers (must be inside component to access `user`)
  const hasRole = (role: string) =>
    !!user?.roles?.some((r) => r.toLowerCase() === role.toLowerCase());

  // Keep api-client token in sync with auth state
  useEffect(() => {
    setAccessToken(token);
  }, [token]);

 // Global 401 handler => clear session
  useEffect(() => {
    setUnauthorizedHandler(() => {
      try {
        sessionStorage.setItem("auth_reason", "expired");
      } catch {
        // ignore
      }

      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // ignore
      }

      setToken(null);
      setUser(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);


  // Rehydrate session when token changes (including first load)
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
        } catch {
          // ignore
        }

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
      } catch {
        // ignore
      }

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
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthed: !!token,
      loading,
      hasRole,
      isAdmin: hasRole("Admin"),
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
