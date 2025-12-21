import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider"; // adjust if your Header is elsewhere

export default function Header() {
  const nav = useNavigate();
  const { isAuthed, user, logout } = useAuth();

  const onLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <NavLink to="/" className="portal-brand">
          <span className="portal-brand-dot" />
          HandyFix
        </NavLink>

        {/* ✅ Hide menu when NOT authed (or show only public links) */}
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
          // If you literally want no menu at all when logged out:
          <div />
          // Or if you want public menu only, replace <div /> with:
          // <nav className="portal-nav">
          //   <NavLink to="/services" className="portal-link">Services</NavLink>
          //   <NavLink to="/blog" className="portal-link">Blog</NavLink>
          // </nav>
        )}

        <div className="portal-spacer" />

        {isAuthed ? (
          <>
            <span className="portal-user">{user?.email ?? ""}</span>
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
  );
}
