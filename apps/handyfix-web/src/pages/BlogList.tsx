import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "@handyfix/api-client";

export default function BlogList() {
  const [posts, setPosts] = useState<api.BlogPostListDto[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const p = await api.listBlog(true);
        setPosts(p);
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load blog");
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <h2>Blog</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {posts.map((p) => (
          <Link
            key={p.id}
            to={`/blog/${p.slug}`}
            style={{ border: "1px solid #eee", padding: 12, borderRadius: 10, textDecoration: "none", color: "inherit" }}
          >
            <div style={{ fontWeight: 800 }}>{p.title}</div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>{p.summary}</div>
          </Link>
        ))}
        {posts.length === 0 && <div style={{ opacity: 0.7 }}>No posts yet.</div>}
      </div>
    </div>
  );
}
