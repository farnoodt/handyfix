import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ChatWidget.css";

/**
 * Lead intake + save on confirm + AI reply + photo upload (persisted until confirm)
 * Steps: name -> issue -> zip -> urgency -> phone -> address(optional) -> photos(optional) -> done
 */

const initialLead = {
  issue: "",
  zip: "",
  urgency: "",
  name: "",
  phone: "",
  address: "",
  photosCount: 0,
  photoUrls: [],
};

const starterMessages = [
  {
    role: "assistant",
    type: "text",
    text: "Hi! I’m HandyFix assistant 👋 What’s your name?",
    ts: Date.now(),
  },
];

// -------------------- Backend helpers --------------------

function getApiBase() {
  const viteBase =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_API_BASE_URL
      : undefined;

  const craBase =
    typeof process !== "undefined" && process.env
      ? process.env.REACT_APP_API_BASE_URL
      : undefined;

  return (viteBase || craBase || "").replace(/\/+$/, "");
}

async function callAiApi(message) {
  const base = getApiBase();
  const url = `${base}/api/ai/chat`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `AI API error (${res.status})`);
  }

  return res.json(); // usually { text: "..." }
}

async function uploadLeadPhotos(filesSnapshot) {
  const base = getApiBase();
  const url = `${base}/api/leads/upload`;

  const form = new FormData();

  // MUST be "files" to match Upload([FromForm] IFormFileCollection files)
  filesSnapshot.slice(0, 3).forEach((p) => {
    form.append("files", p.file);
  });

  const res = await fetch(url, { method: "POST", body: form });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Upload error (${res.status})`);
  }

  return res.json(); // { urls: [...] }
}

async function saveLeadApi(lead) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      issue: lead.issue,
      zipOrCity: lead.zip,
      urgency: lead.urgency,
      name: lead.name,
      phone: lead.phone,
      address: lead.address,
      photosCount: (lead.photoUrls || []).length,
      photoUrls: lead.photoUrls || [],
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { id, status }
}

function extractAiText(data) {
  if (!data) return "Sorry — no response.";
  if (typeof data === "string") return data;
  if (data.output_text) return data.output_text;
  if (data.text) return data.text;
  if (data.message) return data.message;
  return JSON.stringify(data);
}

// -------------------- Helpers --------------------

function normalizePhone(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return "";
}

function isZipOrCity(s) {
  const t = (s || "").trim();
  if (!t) return false;
  const zip = /^\d{5}(-\d{4})?$/.test(t);
  const city = /[a-zA-Z]/.test(t) && t.length >= 2;
  return zip || city;
}

function looksLikeName(s) {
  const t = (s || "").trim();
  return t.length >= 2 && /[a-zA-Z]/.test(t) && t.split(" ").length <= 4;
}

function formatPhone(digits10) {
  if (!digits10 || digits10.length !== 10) return digits10;
  const a = digits10.slice(0, 3);
  const b = digits10.slice(3, 6);
  const c = digits10.slice(6);
  return `(${a}) ${b}-${c}`;
}

function createLeadSummary(lead) {
  const lines = [
    `**Name:** ${lead.name || "-"}`,
    `**Issue:** ${lead.issue || "-"}`,
    `**Zip/City:** ${lead.zip || "-"}`,
    `**Urgency:** ${lead.urgency || "-"}`,
    `**Phone:** ${lead.phone ? formatPhone(lead.phone) : "-"}`,
    `**Address:** ${lead.address || "(optional / not provided)"}`,
    `**Photos selected:** ${lead.photoUrls?.length ?? lead.photosCount ?? 0}`,
  ];
  return lines.join("\n");
}

export default function ChatWidget({ isOpen, onOpenChange }) {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [lead, setLead] = useState(initialLead);
  const [step, setStep] = useState("name"); // name|issue|zip|urgency|phone|address|photos|done

  // Always-latest lead snapshot
  const leadRef = useRef(initialLead);
  useEffect(() => {
    leadRef.current = lead;
  }, [lead]);

  // Persist selected photos across messages until confirm
  const selectedPhotosRef = useRef([]); // [{id,name,url,file}]

  // prevent duplicate saves
  const [leadId, setLeadId] = useState(null);

  // Pending photo previews (UI)
  const [pendingFiles, setPendingFiles] = useState([]); // [{id,name,url,file}]
  const fileInputRef = useRef(null);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const open = !!isOpen;
  const setOpen = (v) => onOpenChange?.(v);

  const canSend = useMemo(() => {
    const hasText = input.trim().length > 0;
    const hasFiles = pendingFiles.length > 0;
    // allow user to press Send with only photos during photos step
    const allowEmptyTextInPhotosStep = step === "photos" && hasFiles;
    return !isTyping && (hasText || hasFiles || allowEmptyTextInPhotosStep);
  }, [input, pendingFiles.length, isTyping, step]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping, open, pendingFiles.length]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      pendingFiles.forEach((f) => URL.revokeObjectURL(f.url));
      selectedPhotosRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;

    const imagesOnly = list.filter((f) => f.type?.startsWith("image/"));
    const limited = imagesOnly.slice(0, 3);

    const newOnes = limited.map((f) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
      name: f.name,
      url: URL.createObjectURL(f),
      file: f,
    }));

    // UI preview
    setPendingFiles((prev) => [...prev, ...newOnes].slice(0, 3));

    // Persist for confirm upload (even after pending is cleared)
    selectedPhotosRef.current = [...selectedPhotosRef.current, ...newOnes].slice(0, 3);
  };

  const removePending = (id) => {
    // remove from pending UI
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });

    // also remove from persisted ref
    selectedPhotosRef.current = selectedPhotosRef.current.filter((p) => p.id !== id);
  };

  const onPickPhoto = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const pushAssistant = (text) => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", type: "text", text, ts: Date.now() + Math.random() },
    ]);
  };

  const pushLeadSummary = (leadObj) => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", type: "lead", lead: leadObj, ts: Date.now() + Math.random() },
    ]);
  };

  const assistantAskForStep = (nextStep) => {
    if (nextStep === "name") return "What’s your name?";
    if (nextStep === "issue") return "Thanks. What do you need help with? (one sentence is fine)";
    if (nextStep === "zip") return "What’s your zip code or city?";
    if (nextStep === "urgency") return "How urgent is this? (today / this week / flexible)";
    if (nextStep === "phone") return "What’s the best phone number to reach you?";
    if (nextStep === "address") return "Optional: what’s the address? (or type “skip”)";
    if (nextStep === "photos") return "Optional: attach up to 3 photos now, or type “skip”.";
    return "Thanks!";
  };

  const interpretAndAdvance = (userText) => {
    const text = (userText || "").trim();

    if (step === "done") {
      return {
        nextStep: "done",
        leadPatch: {},
        reply: "Thanks — we’ve got your details. Anything else you want to add?",
      };
    }

    if (step === "name") {
      if (!looksLikeName(text))
        return { nextStep: "name", leadPatch: {}, reply: "What name should we use?" };
      return { nextStep: "issue", leadPatch: { name: text }, reply: assistantAskForStep("issue") };
    }

    if (step === "issue") {
      if (!text)
        return {
          nextStep: "issue",
          leadPatch: {},
          reply: "Tell me what you need help with (one sentence is fine).",
        };
      return { nextStep: "zip", leadPatch: { issue: text }, reply: assistantAskForStep("zip") };
    }

    if (step === "zip") {
      if (!isZipOrCity(text))
        return {
          nextStep: "zip",
          leadPatch: {},
          reply: "Please enter a zip code (98004) or city (Issaquah).",
        };
      return { nextStep: "urgency", leadPatch: { zip: text }, reply: assistantAskForStep("urgency") };
    }

    if (step === "urgency") {
      const u = text.toLowerCase();
      const normalized =
        u.includes("today")
          ? "Today"
          : u.includes("week")
          ? "This week"
          : u.includes("asap")
          ? "ASAP"
          : u.includes("flex") || u.includes("any")
          ? "Flexible"
          : text;

      if (!normalized)
        return { nextStep: "urgency", leadPatch: {}, reply: "Is it today, this week, or flexible?" };

      return { nextStep: "phone", leadPatch: { urgency: normalized }, reply: assistantAskForStep("phone") };
    }

    if (step === "phone") {
      const normalized = normalizePhone(text);
      if (!normalized)
        return {
          nextStep: "phone",
          leadPatch: {},
          reply: "Please enter a valid 10-digit phone (example: 425-555-1234).",
        };
      return { nextStep: "address", leadPatch: { phone: normalized }, reply: assistantAskForStep("address") };
    }

    if (step === "address") {
      const addr = text.toLowerCase() === "skip" ? "" : text;
      return { nextStep: "photos", leadPatch: { address: addr }, reply: assistantAskForStep("photos") };
    }

    if (step === "photos") {
      const skipped = text.toLowerCase() === "skip";
      const hasSelected = selectedPhotosRef.current.length > 0;

      // if they didn't attach and didn't skip, prompt again
      if (!skipped && !hasSelected) {
        return {
          nextStep: "photos",
          leadPatch: {},
          reply: "You can attach up to 3 photos now, or type “skip”.",
        };
      }

      // finalize
      return {
        nextStep: "done",
        leadPatch: {},
        reply: "Perfect ✅ Here’s what I captured. Reply “confirm” to submit, or type what to change.",
      };
    }

    return { nextStep: step, leadPatch: {}, reply: "Thanks!" };
  };

  const buildAiPrompt = ({ currentLead }) => {
    const summary = createLeadSummary(currentLead);
    return `
You are HandyFix assistant for a handyman company.

Rules:
- Do NOT ask for info already provided in "Captured details".
- Ask at most 1-2 short clarifying questions ONLY if needed.
- End with: "We’ll contact you shortly to schedule and confirm pricing."

Captured details:
${summary}

Write a friendly, concise reply (2-6 sentences).
`.trim();
  };

  const send = async () => {
    if (!canSend) return;

    const text = input.trim();
    const hasPendingPhotos = pendingFiles.length > 0;

    // Push user text (if any)
    if (text) {
      setMessages((prev) => [
        ...prev,
        { role: "user", type: "text", text, ts: Date.now() },
      ]);
    }

    // Push user images preview (if any newly attached)
    if (hasPendingPhotos) {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          type: "images",
          images: pendingFiles.map((p) => ({ url: p.url, name: p.name })),
          ts: Date.now() + 1,
        },
      ]);
    }

    // clear input + pending previews (persisted photos remain in selectedPhotosRef)
    setInput("");
    setPendingFiles([]);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 200));

    const { nextStep, leadPatch, reply } = interpretAndAdvance(text);

    const mergedLead = { ...leadRef.current, ...leadPatch };
    setLead(mergedLead);
    setStep(nextStep);

    pushAssistant(reply);

    // show summary when we reach done
    if (nextStep === "done") {
      // show a summary using local selected count (urls not known yet)
      const summaryLead = {
        ...mergedLead,
        photosCount: selectedPhotosRef.current.length,
      };
      pushLeadSummary(summaryLead);
    }

    const userSaidConfirm = text.toLowerCase() === "confirm";

    // Save + AI on confirm only
    if (userSaidConfirm) {
      const snapshot = leadRef.current;
      const looksComplete =
        !!snapshot.name &&
        !!snapshot.issue &&
        !!snapshot.zip &&
        !!snapshot.urgency &&
        !!snapshot.phone;

      if (!looksComplete) {
        pushAssistant("Please finish the questions first, then type “confirm”.");
        setIsTyping(false);
        return;
      }

      pushAssistant("Thanks! Let me review the details…");

      try {
        let savedId = leadId;

        // Upload photos from persisted ref (this is the key fix)
        let uploadedUrls = [];
        const filesToUpload = selectedPhotosRef.current;

        if (filesToUpload.length > 0) {
          pushAssistant("Uploading your photo(s)…");
          const up = await uploadLeadPhotos(filesToUpload);
          uploadedUrls = up?.urls || [];
        }

        const toSave = {
          ...snapshot,
          photoUrls: uploadedUrls,
          photosCount: uploadedUrls.length,
        };

        if (!savedId) {
          pushAssistant("Saving your request…");
          const saved = await saveLeadApi(toSave);
          savedId = saved?.id ?? null;
          if (savedId) setLeadId(savedId);
          pushAssistant(savedId ? `✅ Confirmed. Ticket #${savedId} saved.` : "✅ Confirmed. Saved.");
        } else {
          pushAssistant(`✅ Already confirmed. Ticket #${savedId}.`);
        }

        // update local lead state so portal shows links count correctly
        setLead(toSave);
        leadRef.current = toSave;

        // clear persisted photos AFTER successful submit
        selectedPhotosRef.current = [];

        // AI reply after save
        const aiPrompt = buildAiPrompt({ currentLead: toSave });
        const aiData = await callAiApi(aiPrompt);
        pushAssistant(extractAiText(aiData));
      } catch (err) {
        pushAssistant("Sorry — I couldn’t upload/save or reach AI right now. Please try again.");
      }
    }

    setIsTyping(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chatw-root" aria-live="polite">
      {open && (
        <div className="chatw-panel" role="dialog" aria-label="Chat with HandyFix">
          <div className="chatw-header">
            <div className="chatw-header-left">
              <div className="chatw-title">HandyFix Assistant</div>
              <div className="chatw-subtitle">Attach photos for faster estimates</div>
            </div>
            <div className="chatw-header-actions">
              <button
                className="chatw-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Minimize chat"
                title="Minimize"
              >
                —
              </button>
              <button
                className="chatw-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatw-body" ref={listRef}>
            {messages.map((m) => {
              const key = m.ts + m.role + (m.type || "text");
              const side = m.role === "user" ? "right" : "left";

              if (m.type === "images") {
                return (
                  <div key={key} className={`chatw-row ${side}`}>
                    <div className={`chatw-bubble ${m.role} chatw-bubble-images`}>
                      <div className="chatw-img-grid">
                        {m.images.map((img) => (
                          <a
                            key={img.url}
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="chatw-img-link"
                            title={img.name}
                          >
                            <img className="chatw-img" src={img.url} alt={img.name} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              if (m.type === "lead") {
                const summary = createLeadSummary(m.lead);
                return (
                  <div key={key} className="chatw-row left">
                    <div className="chatw-bubble assistant chatw-lead">
                      <div className="chatw-lead-title">Lead summary</div>
                      <pre className="chatw-lead-pre">{summary}</pre>
                      <div className="chatw-lead-hint">
                        Type <b>confirm</b> to submit, or tell me what to change.
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className={`chatw-row ${side}`}>
                  <div className={`chatw-bubble ${m.role}`}>{m.text}</div>
                </div>
              );
            })}

            {isTyping && (
              <div className="chatw-row left">
                <div className="chatw-bubble assistant">
                  <span className="chatw-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pending photo previews */}
          {pendingFiles.length > 0 && (
            <div className="chatw-pending">
              {pendingFiles.map((p) => (
                <div key={p.id} className="chatw-pending-item">
                  <img className="chatw-pending-thumb" src={p.url} alt={p.name} />
                  <button
                    className="chatw-pending-remove"
                    onClick={() => removePending(p.id)}
                    aria-label="Remove photo"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="chatw-footer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={onFileChange}
            />
            <button
              className="chatw-attach"
              onClick={onPickPhoto}
              type="button"
              aria-label="Attach photo"
            >
              📎
            </button>

            <textarea
              ref={inputRef}
              className="chatw-input"
              placeholder={
                step === "name"
                  ? "Your name…"
                  : step === "issue"
                  ? "Describe the issue…"
                  : step === "zip"
                  ? "Zip code or city…"
                  : step === "urgency"
                  ? "Today / this week / flexible…"
                  : step === "phone"
                  ? "Phone number…"
                  : step === "address"
                  ? "Address (or type skip)…"
                  : step === "photos"
                  ? "Attach photos or type skip…"
                  : "Add more details…"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
            />

            <button className="chatw-send" onClick={send} disabled={!canSend}>
              Send
            </button>
          </div>

          <div className="chatw-disclaimer">
            For emergencies (gas smell, sparks, flooding), call 911 or your utility provider.
          </div>
        </div>
      )}

      {!open && (
        <button className="chatw-fab" onClick={() => setOpen(true)} aria-label="Open chat">
          💬 Chat
        </button>
      )}
    </div>
  );
}
