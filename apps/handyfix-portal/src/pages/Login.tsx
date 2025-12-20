import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      nav("/");
    } catch (ex: any) {
      setErr(ex?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label>
          Email<br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password<br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button disabled={busy}>{busy ? "Signing in..." : "Login"}</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
      <p style={{ marginTop: 10 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
