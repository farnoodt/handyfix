const services = [
  { title: "Drywall & patching", desc: "Holes, cracks, water damage repair, texture matching, repaint-ready finish." },
  { title: "Interior painting", desc: "Walls, ceilings, trim, cabinets — clean edges and smooth coats." },
  { title: "Flooring", desc: "Laminate / vinyl plank installs, baseboards, transitions, minor subfloor fixes." },
  { title: "Kitchen & bath updates", desc: "Faucets, sinks, vanities, hardware, caulking, small upgrades." },
  { title: "Installation & mounting", desc: "TV mounts, shelves, curtain rods, fixtures, fans, mirrors." },
  { title: "Doors & windows", desc: "Alignment, hinges, handles, weather stripping, locks, drafts." },
];

export default function ServicesPage() {
  return (
    <div className="stack">
      <div className="card">
        <h1>Services</h1>
        <p className="muted">Choose a category — we’ll confirm scope, timeline, and pricing before we start.</p>
      </div>

      <div className="grid-2">
        {services.map((s) => (
          <div className="card" key={s.title}>
            <h3>{s.title}</h3>
            <p className="muted">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="card callout">
        <h2>Not sure what you need?</h2>
        <p className="muted">Send photos + a short description and we’ll guide you.</p>
        <a className="btn" href="/contact">Contact us</a>
      </div>
    </div>
  );
}
