import { Link } from "react-router-dom";

export default function ApiErrorView({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="container" style={{ marginTop: 24 }}>
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <div className="notice" style={{ marginBottom: 12 }}>
          {message || "Please try again."}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Refresh
          </button>
          <Link className="btn" to="/">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
