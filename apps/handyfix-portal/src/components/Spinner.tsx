export default function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="container" style={{ marginTop: 24 }}>
      <div className="card" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>⏳</div>
        <div>{label}</div>
      </div>
    </div>
  );
}
