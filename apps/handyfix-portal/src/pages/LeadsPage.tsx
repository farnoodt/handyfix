import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

type LeadDto = {
  id: number;
  status: string;
  createdAtUtc: string;
  name: string;
  phone: string;
  zipOrCity: string;
  urgency: string;
  issue: string;
  address: string;
  photosCount: number;
  photoUrls: string[]; // ✅ NEW
};

function apiBase() {
  return (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
}

function absUrl(pathOrUrl: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  // if backend returns "/uploads/xxx.jpg"
  return `${apiBase()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatPhone(p: string) {
  const digits = (p || "").replace(/\D/g, "");
  if (digits.length !== 10) return p;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function LeadsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<LeadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const take = 50;

  const latestConfirmed = useMemo(() => {
    return rows.filter((x) => (x.status || "").toLowerCase() === "confirmed");
  }, [rows]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`${apiBase()}/api/leads?take=${take}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as LeadDto[];
        if (!cancelled) setRows(data || []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load leads");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="container">
      <div className="portal-header">
        <h1>Leads</h1>
        <div className="portal-subtitle">Latest {latestConfirmed.length} confirmed leads</div>
      </div>

      <div className="card">
        {loading && <div style={{ padding: 12 }}>Loading…</div>}
        {err && (
          <div style={{ padding: 12, color: "crimson" }}>
            {err}
          </div>
        )}

        {!loading && !err && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>#</th>
                  <th style={th}>Status</th>
                  <th style={th}>Created</th>
                  <th style={th}>Name</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Zip/City</th>
                  <th style={th}>Urgency</th>
                  <th style={th}>Issue</th>
                  <th style={th}>Address</th>
                  <th style={th}>Photos</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={td}>{r.id}</td>
                    <td style={td}>{r.status}</td>
                    <td style={td}>{formatDate(r.createdAtUtc)}</td>
                    <td style={td}>{r.name}</td>
                    <td style={td}>{formatPhone(r.phone)}</td>
                    <td style={td}>{r.zipOrCity}</td>
                    <td style={td}>{r.urgency}</td>
                    <td style={td}>{r.issue}</td>
                    <td style={td}>{r.address || "-"}</td>

                    {/* ✅ NEW: show thumbnails */}
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {(r.photoUrls || []).length === 0 ? (
                          <span>{r.photosCount || 0}</span>
                        ) : (
                          <>
                            <span style={{ minWidth: 16 }}>{(r.photoUrls || []).length}</span>
                            <div style={{ display: "flex", gap: 6 }}>
                              {(r.photoUrls || []).slice(0, 3).map((u) => {
                                const full = absUrl(u);
                                return (
                                  <a
                                    key={u}
                                    href={full}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open photo"
                                    style={{ display: "inline-block" }}
                                  >
                                    <img
                                      src={full}
                                      alt="lead"
                                      style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        objectFit: "cover",
                                        border: "1px solid rgba(0,0,0,0.15)",
                                      }}
                                    />
                                  </a>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td style={td} colSpan={10}>
                      No leads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};
