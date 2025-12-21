import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      nav(location?.state?.from || "/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ marginTop: 24 }}>
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1>Login</h1>
        {error ? <div className="notice" style={{ marginBottom: 12 }}>{error}</div> : null}

        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Email
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="label">
            Password
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
