export type JwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  exp?: number;
  role?: string | string[];
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    // eslint-disable-next-line no-eval
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function getRolesFromPayload(p: JwtPayload | null): string[] {
  if (!p) return [];
  const r = (p as any)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? p.role;
  if (!r) return [];
  return Array.isArray(r) ? r : [String(r)];
}
