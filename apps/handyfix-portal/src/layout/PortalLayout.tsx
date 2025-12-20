import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function PortalLayout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="portal-header">
        <div className="portal-header-inner">
          <NavLink to="/" className="portal-brand" style={{ textDecoration: "none" }}>
            <span className="portal-brand-dot" aria-hidden="true" />
            HandyFix
          </NavLink>

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

          <div className="portal-spacer" />

          <div className="portal-user">{user?.email ?? "—"}</div>
          <button className="btn-primary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <footer className="portal-footer">
        © {new Date().getFullYear()} HandyFix Portal
      </footer>
    </>
  );
}
