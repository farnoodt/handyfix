import { Link, useParams } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="card">
        <h1>Post not found</h1>
        <p className="muted">That article doesn’t exist (or was moved).</p>
        <Link className="btn" to="/blog">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="row row-between">
          <h1 style={{ margin: 0 }}>{post.title}</h1>
          <span className="muted small">{new Date(post.date).toLocaleDateString()}</span>
        </div>

        <div className="chips" style={{ marginTop: 10 }}>
          {post.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>

        <div className="divider" />

        <div className="prose">
          {post.content.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <div className="row">
          <Link className="btn btn-outline" to="/blog">Back</Link>
          <Link className="btn" to="/contact">Request a Quote</Link>
        </div>
      </div>
    </div>
  );
}
