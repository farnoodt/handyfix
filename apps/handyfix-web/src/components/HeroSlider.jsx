import React, { useEffect, useMemo, useState } from "react";
import "./HeroSlider.css";

import s1 from "../assets/hero/01-exterior.jpg";
import s2 from "../assets/hero/02-interior.jpg";
import s3 from "../assets/hero/03-highrise.jpg";
import s4 from "../assets/hero/04-lobby.jpg";
import s5 from "../assets/hero/05-blueprint.jpg";

export default function HeroSlider({ intervalMs = 5500, phone = "4255551234", onChatOpen }) {
  const slides = useMemo(
    () => [
      { src: s1, label: "Luxury Exterior" },
      { src: s2, label: "Luxury Interior" },
      { src: s3, label: "High-rise Perspective" },
      { src: s4, label: "Luxury Lobby" },
      { src: s5, label: "Design Blueprint" },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs, paused]);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <section
      className="hs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.label}
          className={`hs-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${s.src})` }}
          aria-hidden={i !== index}
        />
      ))}

      <div className="hs-overlay" />

      <div className="hs-inner">
        <div className="hs-left">
          <div className="hs-kicker">LUXURY HOMES • HIGH-RISES • PREMIUM SERVICE</div>
          <h1 className="hs-title">Fast, reliable handyman services in Bellevue.</h1>
          <p className="hs-subtitle">
            Plumbing, electrical, carpentry, painting, mounting and more — book in minutes with our assistant.
          </p>

          <div className="hs-actions">
            <a className="hs-primary" href={`tel:${phone}`}>Call Now</a>
            <button
              className="hs-outline"
              type="button"
              onClick={() => onChatOpen?.()}
            >
              Chat with our assistant
            </button>
          </div>

          <div className="hs-meta">
            Serving Bellevue, Redmond, Kirkland and nearby areas.
          </div>
        </div>

        <aside className="hs-card">
          <div className="hs-badge">⚡ Same-week availability</div>
          <div className="hs-card-title">Get a quick estimate</div>
          <div className="hs-card-text">Answer a few questions and we’ll:</div>
          <ul className="hs-card-list">
            <li>Give a rough price range</li>
            <li>Suggest the right time slot</li>
            <li>Confirm if parts are likely needed</li>
          </ul>
          <div className="hs-card-foot">No obligation — you only book if it looks good.</div>
        </aside>
      </div>

      {slides.length > 1 && (
        <>
          <button className="hs-btn hs-prev" onClick={prev} aria-label="Previous">‹</button>
          <button className="hs-btn hs-next" onClick={next} aria-label="Next">›</button>

          <div className="hs-dots" aria-label="Hero slides">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hs-dot ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
