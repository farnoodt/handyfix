import BeforeAfterCard from "../components/BeforeAfterCard";
import { workSamples } from "../data/workSamples";

export default function WorkSamplesPage() {
  return (
    <div className="stack">
      <div className="card">
        <h1>Work Samples (Before / After)</h1>
        <p className="muted">
          Slide the control on each card to compare. Replace placeholder images with your real project photos.
        </p>
      </div>

      <div className="grid-2">
        {workSamples.map((item) => (
          <BeforeAfterCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
