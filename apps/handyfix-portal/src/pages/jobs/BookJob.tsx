import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { createJob, getItems, type ServiceItemDto } from "@handyfix/api-client";

export default function BookJob() {
  const nav = useNavigate();
  const { isAuthed } = useAuth();

  const [items, setItems] = useState<ServiceItemDto[]>([]);
  const [serviceItemId, setServiceItemId] = useState<number | "none">("none");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [preferredDate1, setPreferredDate1] = useState<string>("");
  const [preferredDate2, setPreferredDate2] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const i = await getItems(); // from api-client: /services/items
      setItems(i);
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    // route is already protected, but keeping this is fine
    if (!isAuthed) {
      setErr("Please login first.");
      return;
    }

    setBusy(true);
    try {
      const job = await createJob({
        serviceItemId: serviceItemId === "none" ? null : serviceItemId,
        title,
        description,

        // your API types allow nulls
        addressLine1: addressLine1.trim() ? addressLine1 : null,
        city: city.trim() ? city : null,
        state: state.trim() ? state : null,
        postalCode: postalCode.trim() ? postalCode : null,

        preferredDate1: preferredDate1 ? new Date(preferredDate1).toISOString() : null,
        preferredDate2: preferredDate2 ? new Date(preferredDate2).toISOString() : null,
      });

      // ✅ job.id is string in your DTO
      nav(`/my-jobs/${job.id}`);
    } catch (ex: any) {
      setErr(ex?.message || "Failed to create job");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>Book a Job</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 640 }}>
        <label>
          Service item (optional)<br />
          <select
            value={serviceItemId}
            onChange={(e) =>
              setServiceItemId(e.target.value === "none" ? "none" : Number(e.target.value))
            }
          >
            <option value="none">— select —</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Title<br />
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Description<br />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            Preferred date 1<br />
            <input type="datetime-local" value={preferredDate1} onChange={(e) => setPreferredDate1(e.target.value)} />
          </label>
          <label>
            Preferred date 2<br />
            <input type="datetime-local" value={preferredDate2} onChange={(e) => setPreferredDate2(e.target.value)} />
          </label>
        </div>

        <h3 style={{ marginTop: 10 }}>Address</h3>
        <label>
          Address line 1<br />
          <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <label>City<br /><input value={city} onChange={(e) => setCity(e.target.value)} /></label>
          <label>State<br /><input value={state} onChange={(e) => setState(e.target.value)} /></label>
          <label>Zip<br /><input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></label>
        </div>

        <button disabled={busy}>{busy ? "Submitting..." : "Submit request"}</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}
