"use client";

import { useState } from "react";

const NOTE_TYPES = [
  "Loved something",
  "Menu idea",
  "Order issue",
  "Event or catering",
  "Other",
] as const;

const REQUEST_TYPE = "Question for Anthony";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function ColattaoGuestNoteForm() {
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [noteType, setNoteType] = useState<(typeof NOTE_TYPES)[number]>("Loved something");
  const [message, setMessage] = useState("");
  const [mayContact, setMayContact] = useState<"Yes" | "No" | "">("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const canSubmit = message.trim().length > 0 && Boolean(mayContact) && status !== "loading";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");

    const safeName = name.trim() || "Not provided";
    const safeContact = contactInfo.trim() || "Not provided";
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    const formData = new FormData();
    formData.set("name", safeName === "Not provided" ? "Colattao guest" : safeName);
    formData.set("contactInfo", safeContact);
    formData.set("requestType", REQUEST_TYPE);
    formData.set("priority", "Normal");
    formData.set(
      "message",
      [
        "Colattao Guest Note",
        `Type: ${noteType}`,
        `Name: ${safeName}`,
        `Contact: ${safeContact}`,
        `May contact: ${mayContact}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    );
    formData.set("sourcePage", currentUrl || "menu-guest-note");
    formData.set("company", "");

    try {
      const response = await fetch("/api/owner-requests", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setContactInfo("");
      setNoteType("Loved something");
      setMessage("");
      setMayContact("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="menu-card relative overflow-hidden px-5 pb-5 pt-5 text-[var(--col-espresso)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,162,76,0.18),transparent_54%)]" />
      <div className="relative z-10">
        <p
          className="text-center text-[10px] uppercase text-[var(--col-gold-deep)]"
          style={{ letterSpacing: "0.28em" }}
        >
          Guest Notes
        </p>
        <h2
          className="brand-wordmark mt-1 text-center text-[22px] text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.04em" }}
        >
          Leave a note
        </h2>
        <p className="mx-auto mt-2 max-w-[320px] text-center text-[12px] leading-snug text-[var(--col-espresso-3)]/80">
          Tell the Colattao team what you loved, what needs attention, or what you want to see next.
        </p>

        {status === "success" ? (
          <div className="mt-4 rounded-2xl border border-[var(--col-gold-deep)]/35 bg-[#f8edd7]/70 px-4 py-4 text-center text-[13px] font-semibold text-[var(--col-espresso)]">
            Thank you. Your note was sent to the Colattao team.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="guest-name" className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[var(--col-gold-deep)]">
                  Name <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/45 focus:border-[var(--col-gold-deep)]/75 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="guest-contact" className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[var(--col-gold-deep)]">
                  Contact <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="guest-contact"
                  type="text"
                  value={contactInfo}
                  onChange={(event) => setContactInfo(event.target.value)}
                  placeholder="Email or phone"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/45 focus:border-[var(--col-gold-deep)]/75 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="guest-note-type" className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[var(--col-gold-deep)]">
                Note type
              </label>
              <select
                id="guest-note-type"
                value={noteType}
                onChange={(event) => setNoteType(event.target.value as (typeof NOTE_TYPES)[number])}
                required
                className="w-full rounded-xl border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] focus:border-[var(--col-gold-deep)]/75 focus:outline-none"
              >
                {NOTE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="guest-message" className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[var(--col-gold-deep)]">
                Message
              </label>
              <textarea
                id="guest-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                required
                placeholder="Write your note here..."
                className="w-full rounded-xl border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/45 focus:border-[var(--col-gold-deep)]/75 focus:outline-none"
              />
            </div>

            <fieldset>
              <legend className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[var(--col-gold-deep)]">
                May we contact you?
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(["Yes", "No"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--col-gold-deep)]/35 bg-white/55 px-3 py-2 text-[12px] font-semibold text-[var(--col-espresso)]"
                  >
                    <input
                      type="radio"
                      name="mayContact"
                      value={option}
                      checked={mayContact === option}
                      onChange={() => setMayContact(option)}
                      required
                      className="h-3.5 w-3.5 accent-[var(--col-gold-deep)]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>

            {status === "error" ? (
              <p className="rounded-xl border border-[var(--col-terracotta-2)]/35 bg-white/50 px-3 py-2 text-[12px] text-[var(--col-espresso)]">
                We could not send this note right now. Please try again in a moment.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-gold w-full rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {status === "loading" ? "Sending..." : "Send guest note"}
            </button>
          </form>
        )}

        <p className="mt-3 text-center text-[10px] italic text-[var(--col-espresso-3)]/65">
          This note is emailed to the Colattao team. No account or upload is required.
        </p>
      </div>
    </section>
  );
}
