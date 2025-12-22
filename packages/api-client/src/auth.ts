import { http, unwrap } from "./http";
import type { ApiResponse } from "./types";

export type AuthResponse = {
  token: string;
  email: string;
  fullName: string | null;
  roles: string[];
};

export function login(body: { email: string; password: string }) {
  return unwrap<AuthResponse>(
    http.post<ApiResponse<AuthResponse>>("/api/auth/login", body)
  );
}

export function me() {
  return unwrap<any>(
    http.get<ApiResponse<any>>("/api/auth/me")
  );
}
