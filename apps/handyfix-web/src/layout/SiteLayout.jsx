import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import Header from "../components/Header.jsx";

export default function SiteLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  const openChat = () => setChatOpen(true);

  const goHomeAndScroll = (id) => {
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
    <div className="page">
      <div id="top" />

      {/* Single header only */}
      <Header onChatOpen={openChat} goHomeAndScroll={goHomeAndScroll} />

      <main className="main">
        <Outlet context={{ openChat }} />
      </main>

      <footer className="footer">© {new Date().getFullYear()} HandyFix Bellevue · Licensed &amp; Insured</footer>

      <ChatWidget isOpen={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
