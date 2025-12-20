import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

export default function Header({ onChatOpen }) {
  const location = useLocation();
  const nav = useNavigate();

  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    fontWeight: 700,
    padding: "8px 10px",
    borderRadius: 10,
    color: isActive ? "#4c1d95" : "#334155",
    background: isActive ? "rgba(109, 40, 217, 0.10)" : "transparent"
  });

  const goHomeAndScroll = (id) => {
    // if not on home, go home first then scroll
    if (location.pathname !== "/") {
      nav("/");
      let tries = 0;
      const t = setInterval(() => {
        tries++;
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          clearInterval(t);
        }
        if (tries > 25) clearInterval(t);
      }, 50);
      return;
    }

    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "white",
        borderBottom: "1px solid #e5e7eb"
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ textDecoration: "none", fontWeight: 900, color: "#4c1d95" }}>
          HandyFix Bellevue
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => goHomeAndScroll("services")}
            style={{ padding: "8px 10px", borderRadius: 10, border: 0, background: "transparent", cursor: "pointer", fontWeight: 700, color: "#334155" }}
          >
            Services
          </button>

          <button
            type="button"
            onClick={() => goHomeAndScroll("why-us")}
            style={{ padding: "8px 10px", borderRadius: 10, border: 0, background: "transparent", cursor: "pointer", fontWeight: 700, color: "#334155" }}
          >
            Why us
          </button>

          <button
            type="button"
            onClick={() => goHomeAndScroll("how-it-works")}
            style={{ padding: "8px 10px", borderRadius: 10, border: 0, background: "transparent", cursor: "pointer", fontWeight: 700, color: "#334155" }}
          >
            How it works
          </button>

          <NavLink to="/blog" style={linkStyle}>
            Blog
          </NavLink>

          <button
            type="button"
            onClick={onChatOpen}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#f8fafc",
              cursor: "pointer",
              fontWeight: 800,
              marginLeft: 6
            }}
          >
            Chat
          </button>

          <a
            href="tel:4255551234"
            style={{
              textDecoration: "none",
              padding: "8px 12px",
              borderRadius: 10,
              background: "#6d28d9",
              border: "1px solid #6d28d9",
              color: "white",
              fontWeight: 900
            }}
          >
            Call: (425) 555-1234
          </a>

          <a
            href="http://localhost:5174"
            style={{
              textDecoration: "none",
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "white",
              color: "#334155",
              fontWeight: 800
            }}
          >
            Admin Portal
          </a>
        </nav>
      </div>
    </header>
  );
}
