import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="stack">
      <div className="card">
        <h1>Contact</h1>
        <p className="muted">Send a message and include photos if possible (we can add upload later).</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Request a quote</h2>

          {sent ? (
            <div className="notice">
              <strong>Message saved (demo).</strong>
              <div className="muted">Next step: connect this form to your API or email service.</div>
            </div>
          ) : (
            <form className="form" onSubmit={onSubmit}>
              <label className="label">
                Name
                <input className="input" required placeholder="Your name" />
              </label>

              <label className="label">
                Phone / Email
                <input className="input" required placeholder="(555) 555-5555 or you@email.com" />
              </label>

              <label className="label">
                Job type
                <select className="input" defaultValue="drywall">
                  <option value="drywall">Drywall</option>
                  <option value="painting">Painting</option>
                  <option value="flooring">Flooring</option>
                  <option value="install">Installation / Mounting</option>
                  <option value="bath">Bathroom / Kitchen</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="label">
                Description
                <textarea className="input" required rows={5} placeholder="Describe what you need..." />
              </label>

              <button className="btn" type="submit">Send</button>
            </form>
          )}
        </div>

        <div className="card">
          <h2>Business info</h2>
          <div className="stack">
            <div>
              <div className="muted small">Service Area</div>
              <div>Seattle • Bellevue • Renton • Surrounding</div>
            </div>
            <div>
              <div className="muted small">Hours</div>
              <div>Mon–Sat • 8am–6pm</div>
            </div>
            <div>
              <div className="muted small">Response time</div>
              <div>Same day / next day for most requests</div>
            </div>

            <div className="divider" />

            <div className="notice">
              <strong>Next improvement:</strong>
              <div className="muted">
                Add photo upload + connect to backend API (and later your AI call/chat agent).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
