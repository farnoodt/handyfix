import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useEffect } from "react";


type AuthRedirectState = {
  from?: string;
};



export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const from =
    (location.state as AuthRedirectState | null)?.from ??
    "/";

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
      nav(from, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      const reason = sessionStorage.getItem("auth_reason");
      if (reason === "expired") {
        setError("Your session expired. Please log in again.");
        sessionStorage.removeItem("auth_reason");
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="container" style={{ marginTop: 24 }}>
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1>Login</h1>

        {error ? (
          <div className="notice" style={{ marginBottom: 12 }}>
            {error}
          </div>
        ) : null}

        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Email
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="label">
            Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
