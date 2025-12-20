import { http, unwrap } from "./http";
import type { ApiResponse } from "./types";

export type RegisterRequest = { email: string; password: string; fullName: string };
export type LoginRequest = { email: string; password: string };

export type AuthResponse = {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  fullName: string | null;
  roles: string[];
};

export function register(req: RegisterRequest) {
  return unwrap<AuthResponse>(http.post<ApiResponse<AuthResponse>>("/auth/register", req));
}

export function login(req: LoginRequest) {
  return unwrap<AuthResponse>(http.post<ApiResponse<AuthResponse>>("/auth/login", req));
}

export function me() {
  return unwrap<any>(http.get<ApiResponse<any>>("/auth/me"));
}
