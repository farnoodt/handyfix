import { apiFetch } from "./http";

export type AuthResponse = {
  token: string;
  email: string;
  fullName: string | null;
  roles: string[];
};

export function login(body: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function me() {
  return apiFetch<any>("/api/auth/me");
}
