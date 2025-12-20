import { useMemo, useState } from "react";
import type { WorkSample } from "../data/workSamples";

type Props = { item: WorkSample };

export default function BeforeAfterCard({ item }: Props) {
  const [value, setValue] = useState(55);
  const label = useMemo(() => (value < 50 ? "More BEFORE" : "More AFTER"), [value]);

  return (
    <div className="card">
      <div className="work-head">
        <div>
          <h3>{item.title}</h3>
          <div className="muted small">
            {item.location ? <span>{item.location}</span> : null}
            {item.location && item.tags?.length ? <span className="dot">•</span> : null}
            {item.tags?.length ? <span>{item.tags.join(", ")}</span> : null}
          </div>
        </div>
        <span className="pill">{label}</span>
      </div>

      <div className="before-after" aria-label={`Before and after: ${item.title}`}>
        <img className="before-after__img" src={item.afterUrl} alt={`${item.title} - after`} />
        <div className="before-after__overlay" style={{ width: `${value}%` }}>
          <img className="before-after__img" src={item.beforeUrl} alt={`${item.title} - before`} />
        </div>

        <div className="before-after__labels">
          <span>Before</span>
          <span>After</span>
        </div>
      </div>

      <div className="row row-between">
        <input
          className="range"
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Slide to compare before and after"
        />
        <span className="muted small">{value}% before</span>
      </div>

      {item.notes ? <p className="muted">{item.notes}</p> : null}
    </div>
  );
}
