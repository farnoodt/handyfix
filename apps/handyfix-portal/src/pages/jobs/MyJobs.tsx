import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { getMyJobs, type JobSummaryDto } from "@handyfix/api-client";

function formatDt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function MyJobs() {
  const { isAuthed } = useAuth();
  const [jobs, setJobs] = useState<JobSummaryDto[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Optional: sort newest first
  const rows = useMemo(() => {
    return [...jobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [jobs]);

  useEffect(() => {
    (async () => {
      if (!isAuthed) return;
      setLoading(true);
      try {
        setErr(null);
        const j = await getMyJobs();
        setJobs(j);
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed]);

  if (!isAuthed) return <div>Please login to see your jobs.</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h2>My Jobs</h2>
        <Link className="btn-primary" to="/book" style={{ textDecoration: "none", display: "inline-block" }}>
          + Book a Job
        </Link>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(0,0,0,.03)" }}>
            <tr>
              <th style={th}>Title</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
              <th style={th}>Scheduled</th>
              <th style={{ ...th, width: 90 }}></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((j) => (
              <tr key={j.id} style={tr}>
                <td style={td}>
                  <div style={{ fontWeight: 800 }}>{j.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>#{j.id}</div>
                </td>

                <td style={td}>
                  <span style={badge}>{j.status}</span>
                </td>

                <td style={td}>{formatDt(j.createdAt)}</td>

                <td style={td}>
                  {j.scheduledStart
                    ? `${formatDt(j.scheduledStart)}${j.scheduledEnd ? ` → ${formatDt(j.scheduledEnd)}` : ""}`
                    : <span style={{ opacity: 0.7 }}>—</span>}
                </td>

                <td style={{ ...td, textAlign: "right" }}>
                  <Link to={j.id}>View →</Link>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td style={{ ...td, padding: 18 }} colSpan={5}>
                  <div style={{ opacity: 0.75 }}>No jobs yet.</div>
                  <div style={{ marginTop: 8 }}>
                    <Link to="/book">Book your first job</Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 13,
  opacity: 0.85,
  borderBottom: "1px solid rgba(0,0,0,.08)"
};

const td: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(0,0,0,.06)",
  verticalAlign: "top"
};

const tr: React.CSSProperties = {
  background: "transparent"
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  background: "rgba(109,40,217,.12)",
  border: "1px solid rgba(109,40,217,.22)"
};
