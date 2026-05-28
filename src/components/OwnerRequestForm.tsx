"use client";

import { useState } from "react";

/**
 * Owner request intake form — Phase 1 (database save).
 *
 * On submit, POSTs to /api/owner-requests which saves the request to a
 * private database (Supabase) when REQUESTS_DB_ENABLED is configured.
 *
 * Graceful degradation:
 *   - If the server reports the persisted flow is not enabled/configured
 *     (HTTP 503), the form falls back to a demo confirmation — nothing is
 *     sent or stored.
 *   - On validation/server errors, a retry message + mailto fallback hint
 *     is shown.
 *
 * No file uploads, no email/SMS, no admin dashboard in this phase.
 * No localStorage / cookies are used.
 */

type Status = "idle" | "submitting" | "success" | "demo" | "error";

// Demo access code. Reads a public env value if provided, else a fallback.
// NOTE: this is a lightweight client-side gate for the demo only — it is NOT
// real authentication. The final version must use server-side auth.
const ACCESS_CODE =
  process.env.NEXT_PUBLIC_OWNER_REQUEST_DEMO_CODE || "COLATTAO";

const REQUEST_TYPES = [
  "Menú",
  "Precio",
  "Producto",
  "Foto",
  "Sticker",
  "Sitio web",
  "Juego",
  "Promoción",
  "Otro",
] as const;

const PRIORITIES = ["Baja", "Normal", "Urgente"] as const;

type RequestType = (typeof REQUEST_TYPES)[number];
type Priority = (typeof PRIORITIES)[number];

const labelClass =
  "mb-1 block text-[10px] uppercase tracking-[0.22em] text-[var(--col-gold-deep)]";
const fieldClass =
  "w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/50 focus:border-[var(--col-gold-deep)]/70 focus:outline-none";

export default function OwnerRequestForm() {
  const [type, setType] = useState<RequestType>("Menú");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [whatChanges, setWhatChanges] = useState("");
  const [currentSection, setCurrentSection] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [notes, setNotes] = useState("");
  const [contactName, setContactName] = useState("");
  const [contact, setContact] = useState("");
  const [company, setCompany] = useState(""); // honeypot — stays empty for humans
  const [status, setStatus] = useState<Status>("idle");
  const [refId, setRefId] = useState<string | null>(null);

  // ── Owner/staff access gate (demo only — not real auth) ──
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  const onUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Compare trimmed + case-insensitive; code is never stored anywhere.
    if (codeInput.trim().toLowerCase() === ACCESS_CODE.trim().toLowerCase()) {
      setUnlocked(true);
      setCodeError(false);
      setCodeInput("");
    } else {
      setCodeError(true);
    }
  };

  const resetForm = () => {
    setType("Menú");
    setPriority("Normal");
    setWhatChanges("");
    setCurrentSection("");
    setNewDetail("");
    setNotes("");
    setContactName("");
    setContact("");
    setRefId(null);
    setStatus("idle");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!whatChanges.trim()) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/owner-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: type,
          priority,
          whatChanges,
          currentSection,
          newDetail,
          notes,
          contactName,
          contactInfo: contact,
          sourcePage: "request-update",
          company, // honeypot
        }),
      });

      // Persisted flow not enabled/configured → graceful demo fallback.
      if (res.status === 503) {
        setStatus("demo");
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; id?: string | null }
        | null;

      if (res.ok && data?.ok) {
        setRefId(data.id ?? null);
        setStatus("success");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  // ── Access gate (shown first, before the form) ──
  if (!unlocked) {
    return (
      <form onSubmit={onUnlock} className="menu-card px-6 py-8 text-center">
        <p className="brand-eyebrow text-[var(--col-gold-deep)]">Owner access</p>
        <h2
          className="brand-wordmark mt-2 text-[24px] text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.02em" }}
        >
          Acceso de dueño
        </h2>
        <div className="ceramic-rule mx-auto my-4 w-2/3" />
        <p className="mx-auto max-w-sm text-[12px] leading-relaxed text-[var(--col-espresso-3)]/80">
          Solo para dueños o staff autorizado de Colattao.
        </p>

        <div className="mx-auto mt-5 max-w-xs text-left">
          <label htmlFor="rq-code" className={labelClass}>
            Código de acceso
          </label>
          <input
            id="rq-code"
            type="password"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              if (codeError) setCodeError(false);
            }}
            placeholder="••••••"
            autoComplete="off"
            className={fieldClass}
          />
        </div>

        {codeError ? (
          <p className="mt-3 text-[12px] font-semibold text-[var(--col-terracotta-2)]">
            Código incorrecto. Inténtalo de nuevo.
          </p>
        ) : null}

        <button
          type="submit"
          className="btn-gold mx-auto mt-5 block rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em]"
        >
          Entrar · Enter
        </button>

        <p className="mt-5 text-[11px] italic leading-relaxed text-[var(--col-espresso-3)]/65">
          Demo access only. Final version should use real authentication.
        </p>
      </form>
    );
  }

  // ── Success (saved to DB) ──
  if (status === "success") {
    return (
      <section className="menu-card px-6 py-8 text-center">
        <p className="brand-eyebrow text-[var(--col-gold-deep)]">Solicitud recibida</p>
        <h2
          className="brand-wordmark mt-2 text-[24px] text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.02em" }}
        >
          ¡Gracias!
        </h2>
        <div className="ceramic-rule mx-auto my-4 w-2/3" />
        <p className="mx-auto max-w-md text-[13px] leading-relaxed text-[var(--col-espresso-3)]/85">
          Su solicitud se guardó de forma privada y Anthony le dará seguimiento.
        </p>
        <p className="mx-auto mt-2 max-w-md text-[12px] italic leading-relaxed text-[var(--col-espresso-3)]/70">
          Your request was saved privately. Anthony will follow up.
        </p>
        {refId ? (
          <p className="mt-3 font-mono text-[12px] text-[var(--col-espresso)]">
            Ref: {refId.slice(0, 8).toUpperCase()}
          </p>
        ) : null}
        <button
          type="button"
          onClick={resetForm}
          className="btn-ghost mt-6 rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em]"
        >
          Enviar otra · Send another
        </button>
      </section>
    );
  }

  // ── Demo fallback (persisted flow not enabled) ──
  if (status === "demo") {
    return (
      <section className="menu-card px-6 py-8 text-center">
        <p className="brand-eyebrow text-[var(--col-gold-deep)]">Modo demostración</p>
        <h2
          className="brand-wordmark mt-2 text-[24px] text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.02em" }}
        >
          Solicitud capturada
        </h2>
        <div className="ceramic-rule mx-auto my-4 w-2/3" />
        <p className="mx-auto max-w-md text-[13px] leading-relaxed text-[var(--col-espresso-3)]/85">
          Request captured in demo mode. In the final version, Anthony will receive this instantly
          and it will be saved in the request dashboard.
        </p>
        <p className="mx-auto mt-3 max-w-md text-[12px] italic leading-relaxed text-[var(--col-espresso-3)]/70">
          Solicitud capturada en modo demostración. En la versión final, Anthony la recibirá al
          instante y quedará guardada en el panel de solicitudes.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="btn-ghost mt-6 rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em]"
        >
          Enviar otra · Send another
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="menu-card px-5 py-6 sm:px-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rq-type" className={labelClass}>
            Tipo de solicitud · Request type
          </label>
          <select
            id="rq-type"
            value={type}
            onChange={(e) => setType(e.target.value as RequestType)}
            className={fieldClass}
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t} value={t} className="text-[var(--col-espresso)]">
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rq-priority" className={labelClass}>
            Prioridad · Priority
          </label>
          <select
            id="rq-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={fieldClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="text-[var(--col-espresso)]">
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="rq-what" className={labelClass}>
          Qué necesita cambiar · What needs to change
        </label>
        <input
          id="rq-what"
          type="text"
          value={whatChanges}
          onChange={(e) => setWhatChanges(e.target.value)}
          placeholder="Ej. Cambiar el precio del Churro Latte"
          className={fieldClass}
          autoComplete="off"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="rq-current" className={labelClass}>
          Ítem o sección actual · Current item or section
        </label>
        <input
          id="rq-current"
          type="text"
          value={currentSection}
          onChange={(e) => setCurrentSection(e.target.value)}
          placeholder="Ej. Favoritos → Churro Latte"
          className={fieldClass}
          autoComplete="off"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="rq-new" className={labelClass}>
          Nuevo texto, precio o detalle · New text, price, or detail
        </label>
        <textarea
          id="rq-new"
          value={newDetail}
          onChange={(e) => setNewDetail(e.target.value)}
          rows={3}
          placeholder="Ej. Nuevo precio: $8.50"
          className={fieldClass}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="rq-notes" className={labelClass}>
          Notas · Notes
        </label>
        <textarea
          id="rq-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Cualquier detalle adicional…"
          className={fieldClass}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rq-name" className={labelClass}>
            Nombre de contacto · Contact name
          </label>
          <input
            id="rq-name"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Su nombre"
            className={fieldClass}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="rq-contact" className={labelClass}>
            Correo o teléfono · Email or phone
          </label>
          <input
            id="rq-contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Para dar seguimiento"
            className={fieldClass}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Honeypot — hidden from humans; bots that fill it are silently ignored. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="rq-company">Company</label>
        <input
          id="rq-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {/* ── Future upload area (disabled placeholder) ── */}
      <div
        aria-disabled="true"
        className="mt-5 cursor-not-allowed rounded-xl border border-dashed border-[var(--col-ceramic)]/40 bg-[var(--col-ceramic)]/5 px-4 py-5 text-center opacity-70"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--col-ceramic)]">
          File upload coming next
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--col-espresso-3)]/75">
          Soon you will be able to attach photos, menu screenshots, sticker files, or product
          references.
        </p>
        <p className="mt-1 text-[11px] italic text-[var(--col-espresso-3)]/60">
          Pronto podrá adjuntar fotos, capturas del menú, archivos de stickers o referencias de
          producto.
        </p>
      </div>

      <button
        type="submit"
        disabled={status === "submitting" || !whatChanges.trim()}
        className="btn-gold mt-6 w-full rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {status === "submitting"
          ? "Enviando… · Sending…"
          : "Enviar solicitud · Send request"}
      </button>

      {status === "error" ? (
        <p className="mt-3 rounded-lg border border-[var(--col-terracotta)]/30 bg-[var(--col-terracotta)]/10 px-3 py-2 text-center text-[12px] font-semibold text-[var(--col-terracotta-2)]">
          No se pudo enviar. Intente de nuevo, o escriba a{" "}
          <a
            href="mailto:anthonycolmenares92@gmail.com?subject=Colattao%20Update%20Request"
            className="underline"
          >
            anthonycolmenares92@gmail.com
          </a>
          .
          <span className="mt-1 block font-normal italic text-[var(--col-espresso-3)]/75">
            Couldn&apos;t send. Please try again, or email us.
          </span>
        </p>
      ) : null}

      <p className="mt-3 text-center text-[11px] italic text-[var(--col-espresso-3)]/65">
        No se recopila información de pago · No payment information is collected.
      </p>
    </form>
  );
}
