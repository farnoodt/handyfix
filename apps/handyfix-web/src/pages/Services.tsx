import React, { useEffect, useMemo, useState } from "react";
import * as api from "@handyfix/api-client";

export default function Services() {
  const [cats, setCats] = useState<api.ServiceCategoryDto[]>([]);
  const [items, setItems] = useState<api.ServiceItemDto[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | "all">("all");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const [c, i] = await Promise.all([api.getCategories(), api.getItems()]);
        setCats(c);
        setItems(i);
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load services");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (selectedCat === "all") return items;
    return items.filter((i) => i.serviceCategoryId === selectedCat);
  }, [items, selectedCat]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <h2>Services</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "10px 0" }}>
        <label>
          Category:{" "}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">All</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((i) => (
          <div key={i.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 10 }}>
            <div style={{ fontWeight: 700 }}>{i.name}</div>
            {i.description && <div style={{ opacity: 0.8 }}>{i.description}</div>}
            {i.startingPrice != null && <div style={{ marginTop: 6, fontSize: 13 }}>Starting: ${i.startingPrice}</div>}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ opacity: 0.7 }}>No items yet.</div>}
      </div>
    </div>
  );
}
