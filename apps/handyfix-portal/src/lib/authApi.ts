import { api } from "./http";

export type AuthUser = {
  id?: string;
  email: string;
  role?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export async function login(email: string, password: string) {
  return api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string) {
  return api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me() {
  return api<AuthUser>("/api/auth/me", { method: "GET" });
}
