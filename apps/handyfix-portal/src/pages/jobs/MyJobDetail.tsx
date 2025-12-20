import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as api from "@handyfix/api-client";

export default function MyJobDetail() {
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<api.JobDetailDto | null>(null);
  const [review, setReview] = useState<api.ReviewDto | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const canReview = useMemo(() => job?.status === "Completed", [job?.status]);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        if (!id) return;

        const [j, r] = await Promise.all([api.getJob(id), api.getReview(id)]);
        setJob(j);
        setReview(r);
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load job");
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

  if (!id) return <div>Missing job id.</div>;
  if (!job) return <div>Loading...</div>;

  return (
    <div>
      <h2>Job</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{job.title}</div>
        <div style={{ opacity: 0.8, marginTop: 6 }}>{job.description}</div>

        <div style={{ marginTop: 10, fontSize: 13 }}>
          Status: <b>{job.status}</b>
        </div>

        {job.scheduledStart && (
          <div style={{ marginTop: 6, fontSize: 13 }}>
            Scheduled: {new Date(job.scheduledStart).toLocaleString()} →{" "}
            {job.scheduledEnd ? new Date(job.scheduledEnd).toLocaleString() : "?"}
          </div>
        )}
      </div>

      <h3 style={{ marginTop: 18 }}>Before / After</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {job.media.map((m) => (
          <a key={m.id} href={m.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
              <img src={m.url} alt={m.type} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
              <div style={{ padding: 8, fontSize: 13 }}>
                <b>{m.type}</b>
              </div>
            </div>
          </a>
        ))}
        {job.media.length === 0 && <div style={{ opacity: 0.7 }}>No photos uploaded yet.</div>}
      </div>

      <h3 style={{ marginTop: 18 }}>Review</h3>

      {review ? (
        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 10 }}>
          <div>
            Rating: <b>{review.rating}</b>/5
          </div>
          {review.comment && <div style={{ marginTop: 6 }}>{review.comment}</div>}
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>{new Date(review.createdAt).toLocaleString()}</div>
        </div>
      ) : canReview ? (
        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 10, maxWidth: 520 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <label>
              Rating
              <br />
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Comment (optional)
              <br />
              <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
            </label>

            <button onClick={submitReview}>Submit review</button>
          </div>
        </div>
      ) : (
        <div style={{ opacity: 0.75 }}>Review available after the job is completed.</div>
      )}
    </div>
  );
}
