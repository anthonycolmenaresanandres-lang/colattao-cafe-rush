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
    <section className="relative overflow-hidden rounded-3xl border border-[#c89047]/60 bg-[linear-gradient(180deg,#c9975d_0%,#b5793f_52%,#7b4426_100%)] px-5 pb-5 pt-5 text-[#2b160d] shadow-[0_18px_36px_-20px_rgba(27,14,8,0.85)] ring-1 ring-[#ffe7b8]/35">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,237,196,0.36),transparent_54%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,226,0.16)_0%,rgba(72,34,17,0.16)_100%)]" />
      <div className="relative z-10">
        <p
          className="text-center text-[10px] uppercase text-[#69401f]"
          style={{ letterSpacing: "0.28em" }}
        >
          Guest Notes
        </p>
        <h2
          className="brand-wordmark mt-1 text-center text-[22px] text-[#2b160d]"
          style={{ letterSpacing: "0.04em" }}
        >
          Leave a note
        </h2>
        <p className="mx-auto mt-2 max-w-[320px] text-center text-[12px] font-medium leading-snug text-[#3f2415]/85">
          Tell the Colattao team what you loved, what needs attention, or what you want to see next.
        </p>

        {status === "success" ? (
          <div className="mt-4 rounded-2xl border border-[#8d5729]/40 bg-[#fff1d3]/85 px-4 py-4 text-center text-[13px] font-semibold text-[#2b160d] shadow-inner">
            Thank you. Your note was sent to the Colattao team.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="guest-name" className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[#6a421f]">
                  Name <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-[#9b642f]/35 bg-[#fff8e8]/90 px-3 py-2 text-[13px] text-[#2b160d] shadow-inner placeholder:text-[#6f5138]/45 focus:border-[#8d5729]/80 focus:bg-[#fffaf0] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="guest-contact" className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[#6a421f]">
                  Contact <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="guest-contact"
                  type="text"
                  value={contactInfo}
                  onChange={(event) => setContactInfo(event.target.value)}
                  placeholder="Email or phone"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#9b642f]/35 bg-[#fff8e8]/90 px-3 py-2 text-[13px] text-[#2b160d] shadow-inner placeholder:text-[#6f5138]/45 focus:border-[#8d5729]/80 focus:bg-[#fffaf0] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="guest-note-type" className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[#6a421f]">
                Note type
              </label>
              <select
                id="guest-note-type"
                value={noteType}
                onChange={(event) => setNoteType(event.target.value as (typeof NOTE_TYPES)[number])}
                required
                className="w-full rounded-xl border border-[#9b642f]/35 bg-[#fff8e8]/90 px-3 py-2 text-[13px] text-[#2b160d] shadow-inner focus:border-[#8d5729]/80 focus:bg-[#fffaf0] focus:outline-none"
              >
                {NOTE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="guest-message" className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[#6a421f]">
                Message
              </label>
              <textarea
                id="guest-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                required
                placeholder="Write your note here..."
                className="w-full rounded-xl border border-[#9b642f]/35 bg-[#fff8e8]/90 px-3 py-2 text-[13px] text-[#2b160d] shadow-inner placeholder:text-[#6f5138]/45 focus:border-[#8d5729]/80 focus:bg-[#fffaf0] focus:outline-none"
              />
            </div>

            <fieldset>
              <legend className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#6a421f]">
                May we contact you?
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(["Yes", "No"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#9b642f]/40 bg-[#fff1d3]/72 px-3 py-2 text-[12px] font-semibold text-[#2b160d] shadow-sm"
                  >
                    <input
                      type="radio"
                      name="mayContact"
                      value={option}
                      checked={mayContact === option}
                      onChange={() => setMayContact(option)}
                      required
                      className="h-3.5 w-3.5 accent-[#8d5729]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>

            {status === "error" ? (
              <p className="rounded-xl border border-[#873820]/45 bg-[#fff1d3]/78 px-3 py-2 text-[12px] text-[#2b160d]">
                We could not send this note right now. Please try again in a moment.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-full border border-[#fff0bf]/60 bg-[linear-gradient(180deg,#ffd071_0%,#d99132_58%,#9c5c20_100%)] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#241006] shadow-[0_12px_24px_-14px_rgba(36,16,6,0.85)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            >
              {status === "loading" ? "Sending..." : "Send guest note"}
            </button>
          </form>
        )}

        <p className="mt-3 text-center text-[10px] italic text-[#3f2415]/70">
          This note is emailed to the Colattao team. No account or upload is required.
        </p>
      </div>
    </section>
  );
}
