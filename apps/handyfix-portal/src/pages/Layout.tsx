import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Layout() {
  const { isAuthed, user, isAdmin, logout } = useAuth();

  return (
    <div style={{ fontFamily: "system-ui, Arial", maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/" style={{ fontWeight: 700, textDecoration: "none" }}>HandyFix</Link>
          <nav style={{ display: "flex", gap: 10 }}>
            <Link to="/services">Services</Link>
            <Link to="/book">Book</Link>
            <Link to="/my-jobs">My Jobs</Link>
            <Link to="/blog">Blog</Link>
            {isAdmin && <Link to="/admin">Admin</Link>}
          </nav>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isAuthed ? (
            <>
              <span style={{ fontSize: 13, opacity: 0.8 }}>{user?.email}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>

      <main style={{ marginTop: 18 }}>
        <Outlet />
      </main>

      <footer style={{ marginTop: 48, paddingTop: 12, borderTop: "1px solid #eee", fontSize: 12, opacity: 0.7 }}>
        HandyFix demo frontend • configure API base in <code>.env</code>
      </footer>
    </div>
  );
}
