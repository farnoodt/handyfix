import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="stack">
      <section className="card hero">
        <div className="hero__content">
          <h1>Fast, clean, professional handyman service</h1>
          <p className="muted">
            Repairs, installs, painting, flooring, drywall, and more — with clear pricing and great communication.
          </p>

          <div className="row">
            <Link className="btn" to="/contact">Request a Quote</Link>
            <Link className="btn btn-outline" to="/work-samples">See Before/After</Link>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <div className="card">
          <h3>Transparent estimates</h3>
          <p className="muted">Itemized quotes, simple scope, and no surprises.</p>
        </div>
        <div className="card">
          <h3>Quality workmanship</h3>
          <p className="muted">Clean finishes, durable materials, and attention to detail.</p>
        </div>
        <div className="card">
          <h3>On-time scheduling</h3>
          <p className="muted">Reliable arrival windows and quick turnaround.</p>
        </div>
      </section>

      <section className="card">
        <h2>Popular jobs</h2>
        <div className="chips">
          <span className="chip">Drywall repair</span>
          <span className="chip">Interior painting</span>
          <span className="chip">Caulking & sealing</span>
          <span className="chip">Flooring</span>
          <span className="chip">Kitchen & bath upgrades</span>
          <span className="chip">TV mounting</span>
          <span className="chip">Door & lock fixes</span>
        </div>
      </section>
    </div>
  );
}
