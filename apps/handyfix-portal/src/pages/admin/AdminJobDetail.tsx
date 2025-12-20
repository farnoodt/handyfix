import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as api from "@handyfix/api-client";

const JOB_STATUSES: api.JobStatus[] = [
  "New",
  "Reviewed",
  "Scheduled",
  "InProgress",
  "Completed",
  "Cancelled"
];

export default function AdminJobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<api.JobDetailDto | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [status, setStatus] = useState<api.JobStatus>("New");
  const [scheduledStart, setScheduledStart] = useState<string>("");
  const [scheduledEnd, setScheduledEnd] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");

  const [uploadType, setUploadType] = useState<api.MediaType>("Before");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!id) return;
    const j = await api.getJob(id);
    setJob(j);
    setStatus(j.status);
    setInternalNotes("");
    setScheduledStart(j.scheduledStart ? new Date(j.scheduledStart).toISOString().slice(0, 16) : "");
    setScheduledEnd(j.scheduledEnd ? new Date(j.scheduledEnd).toISOString().slice(0, 16) : "");
  };

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        await load();
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load job");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveStatus = async () => {
    if (!id) return;
    setErr(null);
    setBusy(true);
    try {
      const updated = await api.updateJobStatus(id, {
        status,
        scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
        internalNotes: internalNotes || null
      });
      setJob(updated);
    } catch (ex: any) {
      setErr(ex?.message || "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    if (!id || !uploadFile) return;
    setErr(null);
    setBusy(true);
    try {
      await api.uploadJobMedia(id, uploadType, uploadFile);
      setUploadFile(null);
      await load();
    } catch (ex: any) {
      setErr(ex?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (!id) return <div>Missing job id.</div>;
  if (!job) return <div>Loading...</div>;

  return (
    <div>
      <h3>Job Detail</h3>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{job.title}</div>
        <div style={{ opacity: 0.85, marginTop: 6 }}>{job.description}</div>
        <div style={{ marginTop: 10, fontSize: 13 }}>Created: {new Date(job.createdAt).toLocaleString()}</div>
      </div>

      <h4 style={{ marginTop: 18 }}>Update Status / Schedule</h4>
      <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 12, maxWidth: 720 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            Status
            <br />
            <select value={status} onChange={(e) => setStatus(e.target.value as api.JobStatus)}>
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Scheduled start
              <br />
              <input type="datetime-local" value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} />
            </label>
            <label>
              Scheduled end
              <br />
              <input type="datetime-local" value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)} />
            </label>
          </div>

          <label>
            Internal notes (optional)
            <br />
            <textarea rows={3} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
          </label>

          <button onClick={saveStatus} disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <h4 style={{ marginTop: 18 }}>Upload Before / After Photos</h4>
      <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 12, maxWidth: 720 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select value={uploadType} onChange={(e) => setUploadType(e.target.value as api.MediaType)}>
            <option value="Before">Before</option>
            <option value="After">After</option>
          </select>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />

          <button onClick={upload} disabled={busy || !uploadFile}>
            {busy ? "Uploading..." : "Upload"}
          </button>
        </div>

        <p style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>Backend allows jpg/png/webp up to 25MB.</p>
      </div>

      <h4 style={{ marginTop: 18 }}>Photos</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {job.media.map((m) => (
          <a
            key={m.id}
            href={m.url}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
              <img
                src={m.url}
                alt={m.type}
                style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: 8, fontSize: 13 }}>
                <b>{m.type}</b> • {new Date(m.uploadedAt).toLocaleString()}
              </div>
            </div>
          </a>
        ))}
        {job.media.length === 0 && <div style={{ opacity: 0.7 }}>No photos yet.</div>}
      </div>
    </div>
  );
}
