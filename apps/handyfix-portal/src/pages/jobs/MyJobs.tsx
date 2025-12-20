import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import * as api from "@handyfix/api-client";

export default function MyJobs() {
  const { isAuthed } = useAuth();
  const [jobs, setJobs] = useState<api.JobSummaryDto[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isAuthed) return;
      try {
        setErr(null);
        const j = await api.getMyJobs();
        setJobs(j);
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load jobs");
      }
    })();
  }, [isAuthed]);

  if (!isAuthed) return <div>Please login to see your jobs.</div>;

  return (
    <div>
      <h2>My Jobs</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {jobs.map((j) => (
          <Link
            key={j.id}
            to={`/my-jobs/${j.id}`}
            style={{ border: "1px solid #eee", padding: 12, borderRadius: 10, textDecoration: "none", color: "inherit" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{j.title}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>{new Date(j.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 13 }}>
                <b>{j.status}</b>
              </div>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && <div style={{ opacity: 0.7 }}>No jobs yet.</div>}
      </div>
    </div>
  );
}
