import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import * as api from "@handyfix/api-client";

import HeroSlider from "../components/HeroSlider";
import { ServiceIcon } from "../components/icons/ServiceIcons";

// ✅ Choose: "outline" | "gold" | "mixed"
const ICON_MODE = "mixed";

const FALLBACK_SERVICES = [
  { title: "Plumbing", key: "plumbing", desc: "Leaks, clogs, faucet & toilet repairs." },
  { title: "Electrical", key: "electrical", desc: "Switches, outlets, lights & fixtures." },
  { title: "Carpentry", key: "carpentry", desc: "Doors, trim, cabinets & small wood repairs." },
  { title: "Painting", key: "painting", desc: "Rooms, touch-ups, trims & patching." },
  { title: "Mounting", key: "mounting", desc: "TVs, shelves, mirrors & wall décor." },
  { title: "Drywall & Patch", key: "drywall", desc: "Holes, cracks, texture match & finishing." },
  { title: "Doors & Hardware", key: "doors", desc: "Hinges, locks, handles, alignment fixes." },
  { title: "Bathroom Fixes", key: "bathroom", desc: "Caulking, grout, fans, small repairs." },
  { title: "Kitchen Fixes", key: "kitchen", desc: "Cabinet doors, drawers, sinks & small installs." },
  { title: "Smart Home", key: "smarthome", desc: "Doorbells, cameras, smart switches & setup." },
  { title: "Furniture Assembly", key: "assembly", desc: "Beds, desks, shelves — assembled correctly." },
  { title: "General Repairs", key: "repairs", desc: "Small fixes around the house, done right." }
];

function keyFromName(name) {
  const s = (name || "").toLowerCase();
  if (s.includes("plumb") || s.includes("faucet") || s.includes("toilet")) return "plumbing";
  if (s.includes("elect") || s.includes("outlet") || s.includes("switch") || s.includes("light")) return "electrical";
  if (s.includes("paint")) return "painting";
  if (s.includes("mount") || s.includes("tv") || s.includes("mirror") || s.includes("shelf")) return "mounting";
  if (s.includes("drywall") || s.includes("patch")) return "drywall";
  if (s.includes("door") || s.includes("lock") || s.includes("hinge")) return "doors";
  if (s.includes("bath") || s.includes("grout") || s.includes("caulk")) return "bathroom";
  if (s.includes("kitchen") || s.includes("cabinet") || s.includes("drawer")) return "kitchen";
  if (s.includes("smart") || s.includes("camera") || s.includes("doorbell")) return "smarthome";
  if (s.includes("assemble") || s.includes("assembly")) return "assembly";
  if (s.includes("carpent") || s.includes("trim") || s.includes("wood")) return "carpentry";
  return "repairs";
}

export default function Home() {
  const { openChat } = useOutletContext();

  const [services, setServices] = useState(FALLBACK_SERVICES);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // OPTIONAL: pull services from admin-created items (keeps same UI)
  useEffect(() => {
    (async () => {
      try {
        const [cats, items] = await Promise.all([api.getCategories(), api.getItems()]);
        if (!items?.length) return;

        const catById = new Map(cats.map((c) => [c.id, c]));
        const mapped = items.slice(0, 12).map((it) => {
          const cat = catById.get(it.serviceCategoryId);
          return {
            title: it.name,
            key: keyFromName(it.name || cat?.name || ""),
            desc: it.description || cat?.name || "Ask in chat for details."
          };
        });

        setServices(mapped);
      } catch {
        // ignore and keep fallback services
      }
    })();
  }, []);

  const resolveVariant = (serviceIndex) => {
    if (ICON_MODE === "outline") return "outline";
    if (ICON_MODE === "gold") return "gold";
    const goldIndexes = new Set([0, 1, 4, 9]); // Plumbing, Electrical, Mounting, Smart Home
    return goldIndexes.has(serviceIndex) ? "gold" : "outline";
  };

  return (
    <>
      <HeroSlider phone="4255551234" onChatOpen={openChat} />

      <div className="container">
        {/* WHY US */}
        <section id="why-us" className="section">
          <h2 className="section-title">Why customers choose HandyFix</h2>
          <p className="section-subtitle">A small, local team focused on clear communication and quality work.</p>

          <div className="cards-grid">
            <div className="info-card">
              <div className="info-icon">✅</div>
              <h3>Up-front pricing</h3>
              <p>Clear estimates before we start. No surprise add-ons at the end.</p>
            </div>

            <div className="info-card">
              <div className="info-icon">🛠️</div>
              <h3>Experienced techs</h3>
              <p>Skilled handymen with years of experience in homes and high-rises.</p>
            </div>

            <div className="info-card">
              <div className="info-icon">⭐</div>
              <h3>Respect for your home</h3>
              <p>We arrive on time, protect your space, and clean up before leaving.</p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle">Premium handyman services for luxury homes and high-rise units.</p>
            </div>

            <button className="btn-primary btn-small" type="button" onClick={openChat}>
              Get an estimate in chat
            </button>
          </div>

          <div className="cards-grid services-grid">
            {services.map((s, idx) => (
              <div className="service-card" key={`${s.title}-${idx}`}>
                <div className={`service-icon icon-${s.key}`} aria-hidden="true">
                  <ServiceIcon name={s.key} variant={resolveVariant(idx)} />
                </div>


                <h3>{s.title}</h3>
                <p>{s.desc}</p>

                <button type="button" className="service-cta" onClick={openChat}>
                  Ask in chat <span aria-hidden="true">→</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="section">
          <h2 className="section-title">How it works</h2>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div>
                <h3>Tell us what’s wrong</h3>
                <p>Use chat or a quick call. Attach a photo for faster estimates.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div>
                <h3>Get a time &amp; estimate</h3>
                <p>We suggest a time window and provide a price range before you confirm.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div>
                <h3>Job done, no hassle</h3>
                <p>A pro arrives on time, completes the job, and confirms you’re happy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA STRIP */}
        <section className="cta-strip">
          <div className="cta-text">
            Need something fixed this week?
            <span> Talk to our assistant now.</span>
          </div>
          <div className="cta-actions">
            <a className="btn-primary btn-small" href="tel:4255551234">
              Call (425) 555-1234
            </a>
            <button className="btn-outline btn-small" type="button" onClick={openChat}>
              Open chat
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
