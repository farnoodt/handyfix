import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
//import * as api from "@handyfix/api-client";
import { apiFetch } from "@handyfix/api-client";


type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export default function AdminAiAssistant() {
  const { token } = useAuth();

  const [leadId, setLeadId] = useState<string>("");
  const [lead, setLead] = useState<any>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "system",
      content:
        "You are HandyFix Admin Assistant. Help admins triage leads, propose next steps, draft replies, and suggest estimates. Be concise and action-oriented.",
    },
  ]);

  const authHeaders = useMemo(
    () => ({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
    [token]
  );

  async function loadLead() {
    if (!leadId.trim()) return;
    setLoadingLead(true);
    try {
      // adjust if your api-client has a typed method; this is a safe default:
      //const res = await api.get(`/api/leads/${leadId}`, authHeaders as any);
      const lead = await apiFetch(`/api/leads/${leadId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setLead(lead);
    } catch (e: any) {
      alert(e?.message ?? "Failed to load lead");
      setLead(null);
    } finally {
      setLoadingLead(false);
    }
  }

  function renderLeadSummary() {
    if (!lead) return null;
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Lead Summary</h3>
        <div style={{ display: "grid", gap: 6 }}>
          <div><b>Name:</b> {lead.name}</div>
          <div><b>Issue:</b> {lead.issue}</div>
          <div><b>Urgency:</b> {lead.urgency}</div>
          <div><b>Phone:</b> {lead.phone}</div>
          <div><b>Address:</b> {lead.address}</div>
          <div><b>Zip/City:</b> {lead.zip} {lead.city}</div>
          <div><b>PhotosCount:</b> {lead.photosCount}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Admin AI Assistant</h2>
      <p style={{ marginTop: 6 }}>
        Ask the assistant to triage a lead, draft a reply, propose next steps, and suggest estimate ranges.
      </p>

      <div className="card">
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 220 }}
            placeholder="Enter Lead ID (GUID)"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
          />
          <button className="btn" onClick={loadLead} disabled={loadingLead || !leadId.trim()}>
            {loadingLead ? "Loading..." : "Load lead"}
          </button>
        </div>

        {renderLeadSummary()}

        <hr style={{ margin: "16px 0" }} />

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ maxHeight: 320, overflow: "auto", padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            {messages
              .filter((m) => m.role !== "system")
              .map((m, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700 }}>{m.role === "user" ? "You" : "Assistant"}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
              ))}
            {messages.filter((m) => m.role !== "system").length === 0 && (
              <div style={{ opacity: 0.7 }}>No messages yet.</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Ask about this lead… (e.g., draft a text message to the customer)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  alert("Next step will wire this to /api/ai/chat (backend).");
                }
              }}
            />
            <button
              className="btn"
              disabled={!input.trim()}
              onClick={() => alert("Next step will wire this to /api/ai/chat (backend).")}
            >
              Send
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn"
              onClick={() => setInput("Triage this lead: what are the first 3 actions and what questions should we ask?")}
            >
              Triage + questions
            </button>
            <button
              className="btn"
              onClick={() => setInput("Draft a friendly SMS to confirm the details and set an appointment window.")}
            >
              Draft SMS
            </button>
            <button
              className="btn"
              onClick={() => setInput("Give an estimate range and explain what assumptions you used.")}
            >
              Estimate range
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
