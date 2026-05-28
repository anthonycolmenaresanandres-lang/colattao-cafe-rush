"use client";

import { useState } from "react";

/**
 * Owner request intake form — DEMO MODE.
 *
 * This is UI only. On submit it shows a local confirmation and does NOT:
 *   - send data anywhere
 *   - store data
 *   - use localStorage / cookies
 *
 * Backend (database + email + uploads) is planned separately — see
 * OWNER_REQUEST_SYSTEM_PLAN.md.
 */

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
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // DEMO MODE — no network, no storage. Just show confirmation.
    setSubmitted(true);
  };

  if (submitted) {
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
          onClick={() => setSubmitted(false)}
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
        className="btn-gold mt-6 w-full rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
      >
        Enviar solicitud · Send request
      </button>

      <p className="mt-3 text-center text-[11px] italic text-[var(--col-espresso-3)]/65">
        Demo mode: this form does not send or save information yet.
      </p>
    </form>
  );
}
