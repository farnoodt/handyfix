import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function PortalLayout() {
  const nav = useNavigate();
  const { user, isAuthed, logout } = useAuth();

  const onLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  return (
    <>
      <header className="portal-header">
        <div className="portal-header-inner">
          <NavLink to="/" className="portal-brand" style={{ textDecoration: "none" }}>
            <span className="portal-brand-dot" aria-hidden="true" />
            HandyFix
          </NavLink>

          {/* ✅ Hide menu when logged out */}
          {isAuthed ? (
            <nav className="portal-nav">
              <NavLink to="/services" className={({ isActive }) => (isActive ? "portal-link active" : "portal-link")}>
                Services
              </NavLink>
              <NavLink to="/book" className={({ isActive }) => (isActive ? "portal-link active" : "portal-link")}>
                Book
              </NavLink>
              <NavLink to="/my-jobs" className={({ isActive }) => (isActive ? "portal-link active" : "portal-link")}>
                My Jobs
              </NavLink>
              <NavLink to="/blog" className={({ isActive }) => (isActive ? "portal-link active" : "portal-link")}>
                Blog
              </NavLink>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? "portal-link active" : "portal-link")}>
                Admin
              </NavLink>
            </nav>
          ) : (
            // If you want absolutely no menu when logged out, keep it as <div />
            <div />
            // Or, if you want public links only, use this instead:
            // <nav className="portal-nav">
            //   <NavLink to="/services" className={({ isActive }) => (isActive ? "portal-link active" : "portal-link")}>
            //     Services
            //   </NavLink>
            //   <NavLink to="/blog" className={({ isActive }) => (isActive ? "portal-link active" : "portal-link")}>
            //     Blog
            //   </NavLink>
            // </nav>
          )}

          <div className="portal-spacer" />

          {/* ✅ Right side: Login vs Logout */}
          {isAuthed ? (
            <>
              <div className="portal-user">{user?.email ?? "—"}</div>
              <button type="button" className="btn-primary" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn-primary" style={{ textDecoration: "none" }}>
              Login
            </NavLink>
          )}
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <footer className="portal-footer">© {new Date().getFullYear()} HandyFix Portal</footer>
    </>
  );
}
