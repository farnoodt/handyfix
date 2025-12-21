import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as api from "@handyfix/api-client";

function formatDt(dt: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function statusLabel(status: any): string {
  const map: Record<number, string> = {
    0: "New",
    1: "Reviewed",
    2: "Scheduled",
    3: "In Progress",
    4: "Completed",
    5: "Cancelled",
  };
  if (typeof status === "number") return map[status] ?? String(status);
  if (typeof status === "string") return status;
  return String(status);
}

function isCompleted(status: any) {
  return status === 4 || status === "Completed";
}

function joinAddress(job: api.JobDetailDto) {
  const parts = [job.addressLine1, job.city, job.state, job.postalCode].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export default function MyJobDetail() {
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<api.JobDetailDto | null>(null);
  const [review, setReview] = useState<api.ReviewDto | null>(null);
  const [serviceItemName, setServiceItemName] = useState<string>("—");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadBusy, setUploadBusy] = useState<null | api.MediaType>(null);

  const canReview = useMemo(() => (job ? isCompleted(job.status) : false), [job]);

  useEffect(() => {
    (async () => {
      setErr(null);
      setLoading(true);
      try {
        if (!id) return;

        const [j, r] = await Promise.all([
          api.getJob(id),
          api.getReview(id).catch(() => null),
        ]);

        setJob(j);
        setReview(r);

        if (j.serviceItemId) {
          const items = await api.getItems();
          const found = items.find((x) => x.id === j.serviceItemId);
          setServiceItemName(found?.name ?? `#${j.serviceItemId}`);
        } else {
          setServiceItemName("—");
        }
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const submitReview = async () => {
    if (!id) return;
    setErr(null);
    try {
      const r = await api.createReview(id, { rating, comment: comment.trim() || null });
      setReview(r);
    } catch (ex: any) {
      setErr(ex?.message || "Failed to submit review");
    }
  };

  const upload = async (type: api.MediaType, file: File) => {
    if (!id || !job) return;
    setErr(null);
    setUploadBusy(type);
    try {
      const m = await api.uploadJobMedia(id, type, file);
      setJob({ ...job, media: [...job.media, m] });
    } catch (ex: any) {
      setErr(ex?.message || "Upload failed");
    } finally {
      setUploadBusy(null);
    }
  };

  if (!id) return <div>Missing job id.</div>;
  if (loading) return <div>Loading...</div>;
  if (err) return <div style={{ color: "crimson" }}>{err}</div>;
  if (!job) return <div>Job not found.</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ marginBottom: 0 }}>Job Detail</h2>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{job.title}</div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>{job.description}</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={badge}>{statusLabel(job.status)}</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
              Created: {formatDt(job.createdAt)}
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <div>
            <div style={label}>Service</div>
            <div style={value}>{serviceItemName}</div>
          </div>

          <div>
            <div style={label}>Address</div>
            <div style={value}>{joinAddress(job)}</div>
          </div>

          <div>
            <div style={label}>Preferred dates</div>
            <div style={value}>
              1) {formatDt(job.preferredDate1)} <br />
              2) {formatDt(job.preferredDate2)}
            </div>
          </div>

          <div>
            <div style={label}>Scheduled</div>
            <div style={value}>
              {job.scheduledStart
                ? `${formatDt(job.scheduledStart)} → ${job.scheduledEnd ? formatDt(job.scheduledEnd) : "—"}`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>Before / After</h3>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label style={uploadBtn}>
              {uploadBusy === "Before" ? "Uploading..." : "Upload Before"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploadBusy !== null}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload("Before", f);
                  e.currentTarget.value = "";
                }}
              />
            </label>

            <label style={uploadBtn}>
              {uploadBusy === "After" ? "Uploading..." : "Upload After"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploadBusy !== null}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload("After", f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {job.media.map((m) => (
            <a key={m.id} href={m.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ border: "1px solid rgba(0,0,0,.08)", borderRadius: 12, overflow: "hidden" }}>
                <img src={m.url} alt={m.type} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                <div style={{ padding: 10, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                  <b>{m.type}</b>
                  <span style={{ opacity: 0.7 }}>{formatDt(m.uploadedAt)}</span>
                </div>
              </div>
            </a>
          ))}

          {job.media.length === 0 && <div style={{ opacity: 0.75 }}>No photos uploaded yet.</div>}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Review</h3>

        {review ? (
          <div>
            <div>
              Rating: <b>{review.rating}</b>/5
            </div>
            {review.comment && <div style={{ marginTop: 6 }}>{review.comment}</div>}
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>{formatDt(review.createdAt)}</div>
          </div>
        ) : canReview ? (
          <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            <label>
              Rating<br />
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Comment (optional)<br />
              <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
            </label>

            <button onClick={submitReview}>Submit review</button>
          </div>
        ) : (
          <div style={{ opacity: 0.75 }}>Review available after the job is completed.</div>
        )}
      </div>
    </div>
  );
}

const label: React.CSSProperties = { fontSize: 12, opacity: 0.75, fontWeight: 800, letterSpacing: 0.2 };
const value: React.CSSProperties = { marginTop: 6, fontWeight: 700 };

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  background: "rgba(109,40,217,.12)",
  border: "1px solid rgba(109,40,217,.22)",
};

const uploadBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(0,0,0,.12)",
  background: "rgba(255,255,255,.75)",
};
