import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as api from "@handyfix/api-client";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<api.BlogPostDetailDto | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        if (!slug) return;
        const p = await api.getBlog(slug, false);
        setPost(p);
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load post");
      }
    })();
  }, [slug]);

  if (!slug) return <div style={{ padding: 16 }}>Missing slug.</div>;
  if (err) return <div style={{ color: "crimson", padding: 16 }}>{err}</div>;
  if (!post) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <h2>{post.title}</h2>
      <p style={{ opacity: 0.8 }}>{post.summary}</p>

      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt="cover"
          style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 12 }}
        />
      )}

      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", marginTop: 14 }}>{post.contentMarkdown}</pre>
    </div>
  );
}
