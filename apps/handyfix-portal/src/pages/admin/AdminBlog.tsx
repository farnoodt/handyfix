import React, { useEffect, useState } from "react";
import * as api from "@handyfix/api-client";

type EditState = {
  id: string;
  title: string;
  summary: string;
  contentMarkdown: string;
  coverImageUrl: string;
  published: boolean;
};

function newId() {
  // crypto.randomUUID is not supported in some older environments
  return (globalThis.crypto as any)?.randomUUID?.() ?? `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function empty(): EditState {
  return {
    id: newId(),
    title: "",
    summary: "",
    contentMarkdown: "",
    coverImageUrl: "",
    published: false
  };
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<api.BlogPostListDto[]>([]);
  const [edit, setEdit] = useState<EditState>(empty());
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const p = await api.listBlog(false);
    setPosts(p);
  };

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        await load();
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load posts");
      }
    })();
  }, []);

  const pick = async (p: api.BlogPostListDto) => {
    try {
      setErr(null);
      const full = await api.getBlog(p.slug, true);
      setEdit({
        id: full.id,
        title: full.title,
        summary: full.summary,
        contentMarkdown: full.contentMarkdown,
        coverImageUrl: full.coverImageUrl || "",
        published: full.published
      });
    } catch (ex: any) {
      setErr(ex?.message || "Failed to load post");
    }
  };

  const save = async () => {
    setErr(null);
    setBusy(true);
    try {
      await api.upsertBlog(edit.id, {
        title: edit.title,
        summary: edit.summary,
        contentMarkdown: edit.contentMarkdown,
        coverImageUrl: edit.coverImageUrl || null,
        published: edit.published
      });

      await load();
      // Optional: keep editor focused on saved item (backend may normalize fields)
      // If your backend returns the updated post, we can fetch it here if you want.
    } catch (ex: any) {
      setErr(ex?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm("Delete this post?")) return;
    setErr(null);
    setBusy(true);
    try {
      await api.deleteBlog(edit.id);
      setEdit(empty());
      await load();
    } catch (ex: any) {
      setErr(ex?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h3>Blog Admin</h3>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0 }}>Posts</h4>
            <button onClick={() => setEdit(empty())}>New</button>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {posts.map((p) => (
              <button
                key={p.id}
                onClick={() => pick(p)}
                style={{
                  textAlign: "left",
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                  background: p.id === edit.id ? "#f6f6f6" : "white"
                }}
              >
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{p.published ? "Published" : "Draft"}</div>
              </button>
            ))}
            {posts.length === 0 && <div style={{ opacity: 0.7 }}>No posts yet.</div>}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 12 }}>
          <h4 style={{ marginTop: 0 }}>Editor</h4>

          <div style={{ display: "grid", gap: 10 }}>
            <label>
              Title<br />
              <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            </label>

            <label>
              Summary<br />
              <textarea rows={3} value={edit.summary} onChange={(e) => setEdit({ ...edit, summary: e.target.value })} />
            </label>

            <label>
              Cover image URL (optional)<br />
              <input
                value={edit.coverImageUrl}
                onChange={(e) => setEdit({ ...edit, coverImageUrl: e.target.value })}
              />
            </label>

            <label>
              Content (Markdown or plain text)<br />
              <textarea
                rows={10}
                value={edit.contentMarkdown}
                onChange={(e) => setEdit({ ...edit, contentMarkdown: e.target.value })}
              />
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={edit.published}
                onChange={(e) => setEdit({ ...edit, published: e.target.checked })}
              />
              Published
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={save}
                disabled={busy || !edit.title.trim() || !edit.summary.trim() || !edit.contentMarkdown.trim()}
              >
                {busy ? "Saving..." : "Save"}
              </button>
              <button onClick={del} disabled={busy}>
                Delete
              </button>
            </div>

            <p style={{ fontSize: 12, opacity: 0.75 }}>Backend auto-generates the slug from title on save.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
