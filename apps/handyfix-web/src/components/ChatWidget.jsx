import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ChatWidget.css";

/**
 * Simple lead intake state machine (frontend-only)
 * Steps: issue -> zip -> urgency -> name -> phone -> address(optional) -> done
 */
const initialLead = {
  issue: "",
  zip: "",
  urgency: "",
  name: "",
  phone: "",
  address: "",
  photosCount: 0,
};

const starterMessages = [
  {
    role: "assistant",
    type: "text",
    text: "Hi! I’m HandyFix assistant 👋 Tell me what you need help with. You can also attach a photo.",
    ts: Date.now(),
  },
];

function normalizePhone(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return "";
}

function isZip(s) {
  return /^\d{5}(-\d{4})?$/.test((s || "").trim());
}

function looksLikeName(s) {
  const t = (s || "").trim();
  return t.length >= 2 && /[a-zA-Z]/.test(t) && t.split(" ").length <= 4;
}

function createLeadSummary(lead) {
  const lines = [
    `**Issue:** ${lead.issue || "-"}`,
    `**Zip/City:** ${lead.zip || "-"}`,
    `**Urgency:** ${lead.urgency || "-"}`,
    `**Name:** ${lead.name || "-"}`,
    `**Phone:** ${lead.phone ? formatPhone(lead.phone) : "-"}`,
    `**Address:** ${lead.address || "(optional / not provided)"}`,
    `**Photos:** ${lead.photosCount || 0}`,
  ];
  return lines.join("\n");
}

function formatPhone(digits10) {
  if (!digits10 || digits10.length !== 10) return digits10;
  const a = digits10.slice(0, 3);
  const b = digits10.slice(3, 6);
  const c = digits10.slice(6);
  return `(${a}) ${b}-${c}`;
}

export default function ChatWidget({ isOpen, onOpenChange }) {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Lead intake
  const [lead, setLead] = useState(initialLead);
  const [step, setStep] = useState("issue"); // issue|zip|urgency|name|phone|address|done

  // Photos
  const [pendingFiles, setPendingFiles] = useState([]); // [{id,name,url}]
  const fileInputRef = useRef(null);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const open = !!isOpen;
  const setOpen = (v) => onOpenChange?.(v);

  const canSend = useMemo(() => {
    const hasText = input.trim().length > 0;
    const hasFiles = pendingFiles.length > 0;
    return !isTyping && (hasText || hasFiles);
  }, [input, pendingFiles.length, isTyping]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping, open, pendingFiles.length]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Cleanup object URLs if component unmounts
  useEffect(() => {
    return () => {
      pendingFiles.forEach((f) => URL.revokeObjectURL(f.url));
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
    }));

    setPendingFiles((prev) => [...prev, ...newOnes].slice(0, 3));
  };

  const removePending = (id) => {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
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
    if (nextStep === "zip") {
      return "What’s your zip code (or city)?";
    }
    if (nextStep === "urgency") {
      return "How urgent is this? (today / this week / flexible)";
    }
    if (nextStep === "name") {
      return "What’s your name?";
    }
    if (nextStep === "phone") {
      return "What’s the best phone number to reach you?";
    }
    if (nextStep === "address") {
      return "Optional: what’s the address (or just street + city) for the job?";
    }
    return "Thanks!";
  };

  const interpretAndAdvance = (userText, photosAddedNow) => {
    const text = (userText || "").trim();

    // Update photos count (if sent)
    const photosCount = photosAddedNow ? photosAddedNow : 0;

    // If we already finished, just keep chatting
    if (step === "done") {
      return {
        nextStep: "done",
        leadPatch: photosCount ? { photosCount: lead.photosCount + photosCount } : {},
        reply:
          "Thanks — we’ve got your details. Anything else you want to add about the job (size, access, parking, etc.)?",
      };
    }

    // Step logic
    if (step === "issue") {
      // Accept issue from text OR photos only
      const issueValue = text || (photosCount ? "Issue shared via photo" : "");
      if (!issueValue) {
        return { nextStep: "issue", leadPatch: {}, reply: "Tell me what you need help with (one sentence is fine)." };
      }
      return {
        nextStep: "zip",
        leadPatch: {
          issue: issueValue,
          photosCount: lead.photosCount + photosCount,
        },
        reply: assistantAskForStep("zip"),
      };
    }

    if (step === "zip") {
      // Try zip validation; allow city too (no strict validation)
      const zipOrCity = text;
      if (!zipOrCity) {
        return { nextStep: "zip", leadPatch: {}, reply: "Please share your zip code (or city)." };
      }
      // If zip is valid -> store it. If not zip, store raw (city)
      return {
        nextStep: "urgency",
        leadPatch: {
          zip: isZip(zipOrCity) ? zipOrCity : zipOrCity,
          photosCount: lead.photosCount + photosCount,
        },
        reply: assistantAskForStep("urgency"),
      };
    }

    if (step === "urgency") {
      const u = text.toLowerCase();
      const normalized =
        u.includes("today") ? "Today" :
        u.includes("week") ? "This week" :
        u.includes("asap") ? "ASAP" :
        u.includes("flex") || u.includes("any") ? "Flexible" :
        text;

      if (!normalized) {
        return { nextStep: "urgency", leadPatch: {}, reply: "Is it today, this week, or flexible?" };
      }

      return {
        nextStep: "name",
        leadPatch: { urgency: normalized, photosCount: lead.photosCount + photosCount },
        reply: assistantAskForStep("name"),
      };
    }

    if (step === "name") {
      if (!looksLikeName(text)) {
        return { nextStep: "name", leadPatch: {}, reply: "What name should we put on the booking?" };
      }
      return {
        nextStep: "phone",
        leadPatch: { name: text, photosCount: lead.photosCount + photosCount },
        reply: assistantAskForStep("phone"),
      };
    }

    if (step === "phone") {
      const normalized = normalizePhone(text);
      if (!normalized) {
        return {
          nextStep: "phone",
          leadPatch: {},
          reply: "Please enter a valid 10-digit phone number (example: 425-555-1234).",
        };
      }
      return {
        nextStep: "address",
        leadPatch: { phone: normalized, photosCount: lead.photosCount + photosCount },
        reply: assistantAskForStep("address") + "\n\n(You can type “skip” to continue.)",
      };
    }

    if (step === "address") {
      const t = text.toLowerCase();
      const addr = t === "skip" ? "" : text;

      // finalize
      const finalLead = {
        ...lead,
        address: addr,
        photosCount: lead.photosCount + photosCount,
      };

      return {
        nextStep: "done",
        leadPatch: { address: addr, photosCount: finalLead.photosCount },
        reply:
          "Perfect ✅ Here’s what I captured. Reply “confirm” if it’s correct, or type what to change.",
        finalLead,
      };
    }

    return { nextStep: step, leadPatch: {}, reply: "Thanks!" };
  };

  const send = async () => {
    if (!canSend) return;

    const text = input.trim();
    const hasPhotos = pendingFiles.length > 0;

    // Push user text (if any)
    if (text) {
      setMessages((prev) => [
        ...prev,
        { role: "user", type: "text", text, ts: Date.now() },
      ]);
    }

    // Push user images (if any)
    if (hasPhotos) {
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

    // Reset input/pending
    setInput("");
    const photosCountNow = hasPhotos ? pendingFiles.length : 0;
    setPendingFiles([]);
    setIsTyping(true);

    // Simulate delay
    await new Promise((r) => setTimeout(r, 550));

    // Update lead + advance step
    const { nextStep, leadPatch, reply, finalLead } = interpretAndAdvance(text, photosCountNow);

    setLead((prev) => ({ ...prev, ...leadPatch }));
    setStep(nextStep);

    // If final lead was computed at address step, show summary card after the text
    pushAssistant(reply);

    if (finalLead) {
      // Build summary using merged state
      const merged = { ...finalLead, ...leadPatch };
      pushLeadSummary(merged);
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
                  <div key={key} className={`chatw-row left`}>
                    <div className="chatw-bubble assistant chatw-lead">
                      <div className="chatw-lead-title">Lead summary</div>
                      <pre className="chatw-lead-pre">{summary}</pre>
                      <div className="chatw-lead-hint">
                        Type <b>confirm</b> to continue, or tell me what to change.
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

            <button className="chatw-attach" onClick={onPickPhoto} type="button" aria-label="Attach photo">
              📎
            </button>

            <textarea
              ref={inputRef}
              className="chatw-input"
              placeholder={
                step === "issue" ? "Describe the issue…" :
                step === "zip" ? "Zip code or city…" :
                step === "urgency" ? "Today / this week / flexible…" :
                step === "name" ? "Your name…" :
                step === "phone" ? "Phone number…" :
                step === "address" ? "Address (or type skip)…" :
                "Add more details…"
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
