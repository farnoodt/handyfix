import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "@handyfix/api-client";
import { decodeJwt, getRolesFromPayload } from "./jwt";

type AuthUser = {
  userId: string;
  email: string;
  fullName?: string | null;
  roles: string[];
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthed: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = "handyfix_token";
const AuthContext = createContext<AuthContextValue | null>(null);

function buildUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const roles = getRolesFromPayload(payload);
  const userId = payload.sub || "";
  const email = payload.email || "";
  const fullName = payload.name || null;

  if (!userId || !email) return null;
  return { userId, email, fullName, roles };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => (token ? buildUserFromToken(token) : null));

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setUser(buildUserFromToken(token));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    // force clean string types (prevents FormDataEntryValue / undefined issues upstream)
    const cleanEmail = String(email ?? "").trim();
    const cleanPassword = String(password ?? "");

    const res = await api.login({ email: cleanEmail, password: cleanPassword });
    setToken(res.token);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const cleanFullName = String(fullName ?? "").trim();
    const cleanEmail = String(email ?? "").trim();
    const cleanPassword = String(password ?? "");

    const res = await api.register({ fullName: cleanFullName, email: cleanEmail, password: cleanPassword });
    setToken(res.token);
  };

  const logout = () => setToken(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthed: !!token && !!user,
      isAdmin: !!user?.roles?.includes("Admin"),
      login,
      register,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
