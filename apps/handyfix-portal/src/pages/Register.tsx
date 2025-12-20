import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      nav("/");
    } catch (ex: any) {
      setErr(ex?.message || "Register failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label>
          Full name<br />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          Email<br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password<br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
