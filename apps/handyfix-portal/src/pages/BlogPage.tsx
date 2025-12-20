import { useMemo, useState } from "react";
import BlogCard from "../components/BlogCard";
import { blogPosts } from "../data/blogPosts";

export default function BlogPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return blogPosts;

    return blogPosts.filter((p) => {
      const hay = `${p.title} ${p.excerpt} ${p.tags.join(" ")} ${p.content.join(" ")}`.toLowerCase();
      return hay.includes(s);
    });
  }, [q]);

  return (
    <div className="stack">
      <div className="card">
        <h1>Blog</h1>
        <p className="muted">Construction tips, materials, colors, and maintenance guides.</p>

        <div className="row">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles..."
            aria-label="Search blog posts"
          />
        </div>
      </div>

      <div className="grid-2">
        {filtered.map((p) => (
          <BlogCard key={p.slug} post={p} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <p className="muted">No posts found. Try a different keyword.</p>
        </div>
      ) : null}
    </div>
  );
}
