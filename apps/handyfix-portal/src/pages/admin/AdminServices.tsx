import React, { useEffect, useState } from "react";
import * as api from "@handyfix/api-client";

export default function AdminServices() {
  const [cats, setCats] = useState<api.ServiceCategoryDto[]>([]);
  const [items, setItems] = useState<api.ServiceItemDto[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const [newItemCatId, setNewItemCatId] = useState<number | "none">("none");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<string>("");

  const load = async () => {
    const [c, i] = await Promise.all([api.getCategories(), api.getItems()]);
    setCats(c);
    setItems(i);
  };

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        await load();
      } catch (ex: any) {
        setErr(ex?.message || "Failed to load");
      }
    })();
  }, []);

  const createCat = async () => {
    try {
      setErr(null);
      await api.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim() ? newCatDesc.trim() : null
      });
      setNewCatName("");
      setNewCatDesc("");
      await load();
    } catch (ex: any) {
      setErr(ex?.message || "Failed to create category");
    }
  };

  const createItem = async () => {
    try {
      setErr(null);
      if (newItemCatId === "none") {
        setErr("Select category");
        return;
      }

      const price = newItemPrice.trim();
      const parsedPrice = price === "" ? null : Number(price);

      if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
        setErr("Starting price must be a number");
        return;
      }

      await api.createItem({
        serviceCategoryId: newItemCatId,
        name: newItemName.trim(),
        description: newItemDesc.trim() ? newItemDesc.trim() : null,
        startingPrice: parsedPrice
      });

      setNewItemName("");
      setNewItemDesc("");
      setNewItemPrice("");
      await load();
    } catch (ex: any) {
      setErr(ex?.message || "Failed to create item");
    }
  };

  return (
    <div>
      <h3>Services Catalog</h3>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 12 }}>
          <h4>Create Category</h4>
          <div style={{ display: "grid", gap: 8 }}>
            <input placeholder="Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            <input
              placeholder="Description (optional)"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
            />
            <button onClick={createCat} disabled={!newCatName.trim()}>
              Create
            </button>
          </div>
        </div>

        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 12 }}>
          <h4>Create Item</h4>
          <div style={{ display: "grid", gap: 8 }}>
            <select
              value={newItemCatId}
              onChange={(e) => setNewItemCatId(e.target.value === "none" ? "none" : Number(e.target.value))}
            >
              <option value="none">— category —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input placeholder="Name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
            <input
              placeholder="Description (optional)"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
            />
            <input
              placeholder="Starting price (optional)"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
            />
            <button onClick={createItem} disabled={newItemCatId === "none" || !newItemName.trim()}>
              Create
            </button>
          </div>
        </div>
      </div>

      <h4 style={{ marginTop: 18 }}>Current Categories</h4>
      <ul>
        {cats.map((c) => (
          <li key={c.id}>
            <b>{c.name}</b> {c.description ? `— ${c.description}` : ""}
          </li>
        ))}
      </ul>

      <h4 style={{ marginTop: 18 }}>Current Items</h4>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <b>{i.name}</b> (cat #{i.serviceCategoryId}) {i.startingPrice != null ? `— $${i.startingPrice}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
