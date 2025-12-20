import { Link } from "react-router-dom";
import type { BlogPost } from "../data/blogPosts";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <div className="card">
      <div className="row row-between">
        <h3 style={{ margin: 0 }}>{post.title}</h3>
        <span className="muted small">{new Date(post.date).toLocaleDateString()}</span>
      </div>

      <p className="muted">{post.excerpt}</p>

      <div className="row row-between">
        <div className="chips">
          {post.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>

        <Link className="btn btn-outline" to={`/blog/${post.slug}`}>
          Read
        </Link>
      </div>
    </div>
  );
}
