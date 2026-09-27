"use client";

import { useState } from "react";
import styles from "./ColattaoGuestNoteForm.module.css";

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
    formData.set("sourcePage", currentUrl ? `Colattao QR Menu - ${currentUrl}` : "Colattao QR Menu");
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
    <section className={styles.formSection} aria-labelledby="guest-note-title">
      <p className={styles.eyebrow}>Guest notes</p>
      <h2 id="guest-note-title">Leave us a note.</h2>
      <p className={styles.intro}>
        Tell the Colattao team what you loved, what needs attention or what you want to see next.
      </p>

      {status === "success" ? (
        <div className={styles.success} role="status">
          Thank you. Your note was sent to the Colattao team.
        </div>
      ) : (
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.twoColumn}>
            <div className={styles.field}>
              <label htmlFor="guest-name">
                Name <span>optional</span>
              </label>
              <input
                id="guest-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="guest-contact">
                Contact <span>optional</span>
              </label>
              <input
                id="guest-contact"
                type="text"
                value={contactInfo}
                onChange={(event) => setContactInfo(event.target.value)}
                placeholder="Email or phone"
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="guest-note-type">Note type</label>
            <select
              id="guest-note-type"
              value={noteType}
              onChange={(event) => setNoteType(event.target.value as (typeof NOTE_TYPES)[number])}
              required
            >
              {NOTE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="guest-message">Message</label>
            <textarea
              id="guest-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              required
              placeholder="Write your note here"
            />
          </div>

          <fieldset className={styles.contactChoice}>
            <legend>May we contact you?</legend>
            <div>
              {(["Yes", "No"] as const).map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="mayContact"
                    value={option}
                    checked={mayContact === option}
                    onChange={() => setMayContact(option)}
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          {status === "error" ? (
            <p className={styles.error} role="alert">
              We could not send this note right now. Please try again in a moment.
            </p>
          ) : null}

          <button type="submit" disabled={!canSubmit}>
            {status === "loading" ? "Sending..." : "Send guest note"}
          </button>
        </form>
      )}

      <p className={styles.privacy}>
        Your note goes directly to the Colattao team. No account is required.
      </p>
    </section>
  );
}
