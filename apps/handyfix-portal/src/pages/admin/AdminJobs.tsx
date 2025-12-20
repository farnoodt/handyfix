import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "@handyfix/api-client";

const JOB_STATUSES: api.JobStatus[] = ["New", "Reviewed", "Scheduled", "InProgress", "Completed", "Cancelled"];

export default function AdminJobs() {
  const [status, setStatus] = useState<api.JobStatus | "">("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: api.JobSummaryDto[]; totalCount: number; pageSize: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const res = await api.listJobs({ page, pageSize: 20, status: status || "" });
    setData({ items: res.items, totalCount: res.totalCount, pageSize: res.pageSize });
  };

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        await load();
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load jobs");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1;

  return (
    <div>
      <h3>Jobs</h3>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <label>
          Status:{" "}
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as any);
            }}
          >
            <option value="">All</option>
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <span style={{ fontSize: 13 }}>
            Page {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {data?.items?.map((j) => (
          <Link
            key={j.id}
            to={`/admin/jobs/${j.id}`}
            style={{
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{j.title}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>{new Date(j.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 13 }}>
                <b>{j.status}</b>
              </div>
            </div>
          </Link>
        ))}
        {(data?.items?.length ?? 0) === 0 && <div style={{ opacity: 0.7 }}>No jobs found.</div>}
      </div>
    </div>
  );
}
