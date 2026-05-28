"use client";

import { useState } from "react";
import appTheme from "@/config/theme";

/**
 * Lightweight feedback box.
 *
 * On submit, opens the user's mail client with a pre-filled message to
 * Anthony. Nothing is stored anywhere — no backend, no database.
 *
 * Pass `pageSource` so messages tell us which page the feedback came from.
 */

const FEEDBACK_EMAIL = "anthonycolmenares92@gmail.com";
const FEEDBACK_SUBJECT = "Colattao Feedback";

type FeedbackType =
  | "General"
  | "Juego"
  | "Menú"
  | "Stickers"
  | "Presentación"
  | "Idea futura";

const FEEDBACK_TYPES: FeedbackType[] = [
  "General",
  "Juego",
  "Menú",
  "Stickers",
  "Presentación",
  "Idea futura",
];

type Variant = "light" | "dark";

export default function FeedbackBox({
  pageSource,
  variant = "dark",
  title = "¿Algún comentario?",
}: {
  /** Free-form label that identifies which page the box lives on. */
  pageSource?: string;
  /** "dark" = on espresso shell (/, /owner-presentation). "light" = on parchment (/menu). */
  variant?: Variant;
  title?: string;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<FeedbackType>("General");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";

    const bodyLines = [
      `Nombre: ${name.trim() || "(no incluido)"}`,
      `Tipo: ${type}`,
      `Comentario:`,
      comment.trim(),
      "",
      `Página: ${pageSource ?? "(no especificada)"}`,
      `URL: ${currentUrl}`,
    ];

    const mailto = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
      FEEDBACK_SUBJECT,
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    if (typeof window !== "undefined") {
      window.location.href = mailto;
    }
    setSent(true);
  };

  const isDark = variant === "dark";

  const cardClass = isDark
    ? "rounded-2xl border border-amber-300/20 bg-white/[0.04] p-4 backdrop-blur-sm"
    : "menu-card px-4 pb-4 pt-4";

  const labelClass = isDark
    ? "text-[10px] uppercase tracking-[0.22em] text-amber-200/75"
    : "text-[10px] uppercase tracking-[0.22em] text-[var(--col-gold-deep)]";

  const inputClass = isDark
    ? "w-full rounded-md border border-amber-300/25 bg-black/30 px-3 py-2 text-[13px] text-amber-50 placeholder:text-amber-200/40 focus:border-amber-300/60 focus:outline-none"
    : "w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/50 focus:border-[var(--col-gold-deep)]/70 focus:outline-none";

  const titleClass = isDark
    ? "brand-wordmark text-[18px] text-amber-50"
    : "brand-wordmark text-[18px] text-[var(--col-espresso)]";

  const noteClass = isDark
    ? "mt-2 text-center text-[10px] italic text-amber-200/55"
    : "mt-2 text-center text-[10px] italic text-[var(--col-espresso-3)]/65";

  return (
    <section className={cardClass}>
      <p className={`text-center ${labelClass}`}>Comentarios</p>
      <h3
        className={`mt-1 text-center ${titleClass}`}
        style={{ letterSpacing: "0.04em" }}
      >
        {title}
      </h3>

      {sent ? (
        <p
          className={`mt-3 text-center text-[12.5px] ${
            isDark ? "text-amber-100/85" : "text-[var(--col-espresso)]"
          }`}
        >
          Gracias. Su correo se abrió listo para enviarse — solo presione
          enviar para que el comentario llegue a Anthony.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-3 space-y-2.5">
          <div>
            <label htmlFor="fb-name" className={`mb-1 block ${labelClass}`}>
              Nombre <span className="opacity-60">(opcional)</span>
            </label>
            <input
              id="fb-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Su nombre"
              className={inputClass}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="fb-type" className={`mb-1 block ${labelClass}`}>
              Tipo de comentario
            </label>
            <select
              id="fb-type"
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
              className={inputClass}
            >
              {FEEDBACK_TYPES.map((t) => (
                <option key={t} value={t} className="text-[var(--col-espresso)]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fb-comment" className={`mb-1 block ${labelClass}`}>
              Comentario
            </label>
            <textarea
              id="fb-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Cuéntenos qué piensa…"
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!comment.trim()}
            className="btn-gold mt-1 w-full rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {appTheme.ui.feedbackButtonText}
          </button>
        </form>
      )}

      <p className={noteClass}>
        Este comentario se envía por correo. No se guarda en una base de datos.
      </p>
    </section>
  );
}
