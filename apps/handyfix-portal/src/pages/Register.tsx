import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Registration is disabled</h2>

      <p style={{ marginBottom: 12 }}>
        HandyFix Portal accounts are created by an administrator. Please contact support
        if you need access.
      </p>

      <p style={{ marginBottom: 0 }}>
        <Link to="/login">Go to Login</Link>
      </p>
    </div>
  );
}
