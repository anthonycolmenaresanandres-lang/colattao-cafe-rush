"use client";

import { useMemo, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const REQUEST_TYPES = [
  "Menu update",
  "Price change",
  "New item",
  "Remove item",
  "Photo/design upload",
  "Website idea",
  "Game idea",
  "Question for Anthony",
] as const;

const PRIORITIES = ["Low", "Normal", "Urgent"] as const;

const MAX_FILES = 5;

const labelClass =
  "mb-1 block text-[10px] uppercase tracking-[0.22em] text-[var(--col-gold-deep)]";
const fieldClass =
  "w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/50 focus:border-[var(--col-gold-deep)]/70 focus:outline-none";

export default function OwnerRequestForm() {
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [requestType, setRequestType] = useState<(typeof REQUEST_TYPES)[number]>("Menu update");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("Normal");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedFileNames = useMemo(() => files.map((file) => file.name), [files]);

  const isValid = name.trim() && contactInfo.trim() && message.trim();

  const resetForm = () => {
    setName("");
    setContactInfo("");
    setRequestType("Menu update");
    setPriority("Normal");
    setMessage("");
    setFiles([]);
    setCompany("");
    setErrorMessage("");
    setStatus("idle");
  };

  const onFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setFiles(selected.slice(0, MAX_FILES));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("contactInfo", contactInfo);
    formData.append("requestType", requestType);
    formData.append("priority", priority);
    formData.append("message", message);
    formData.append("sourcePage", window.location.href);
    formData.append("company", company);

    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch("/api/owner-requests", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; reason?: string; detail?: string }
        | null;

      if (response.ok && payload?.ok) {
        setStatus("success");
        return;
      }

      if (response.status === 503) {
        setErrorMessage(
          "Service is not configured yet. Please set Blob and Resend environment variables.",
        );
      } else {
        setErrorMessage(payload?.detail || "No se pudo enviar la solicitud. Intente de nuevo.");
      }
      setStatus("error");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <section className="menu-card px-6 py-8 text-center">
        <p className="brand-eyebrow text-[var(--col-gold-deep)]">Solicitud enviada</p>
        <h2
          className="brand-wordmark mt-2 text-[24px] text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.02em" }}
        >
          Request sent
        </h2>
        <div className="ceramic-rule mx-auto my-4 w-2/3" />
        <p className="mx-auto max-w-md text-[13px] leading-relaxed text-[var(--col-espresso-3)]/85">
          Request sent. Anthony will review it.
        </p>
        <p className="mx-auto mt-2 max-w-md text-[12px] italic leading-relaxed text-[var(--col-espresso-3)]/70">
          Solicitud enviada. Anthony la revisarÃ¡.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="btn-ghost mt-6 rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em]"
        >
          Enviar otra Â· Send another
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="menu-card px-5 py-6 sm:px-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="owner-name" className={labelClass}>
            Nombre Â· Name
          </label>
          <input
            id="owner-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
            placeholder="Nombre"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label htmlFor="owner-contact" className={labelClass}>
            Correo o telÃ©fono Â· Email or phone
          </label>
          <input
            id="owner-contact"
            type="text"
            value={contactInfo}
            onChange={(event) => setContactInfo(event.target.value)}
            className={fieldClass}
            placeholder="you@email.com / (555) 000-0000"
            autoComplete="off"
            required
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="owner-type" className={labelClass}>
            Tipo de solicitud Â· Request type
          </label>
          <select
            id="owner-type"
            value={requestType}
            onChange={(event) => setRequestType(event.target.value as (typeof REQUEST_TYPES)[number])}
            className={fieldClass}
            required
          >
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="owner-priority" className={labelClass}>
            Prioridad Â· Priority
          </label>
          <select
            id="owner-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as (typeof PRIORITIES)[number])}
            className={fieldClass}
            required
          >
            {PRIORITIES.map((priorityOption) => (
              <option key={priorityOption} value={priorityOption}>
                {priorityOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="owner-message" className={labelClass}>
          Mensaje Â· Message
        </label>
        <textarea
          id="owner-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className={fieldClass}
          placeholder="Describa su solicitud aquÃ­â€¦"
          required
        />
      </div>

      <div className="mt-4">
        <label htmlFor="owner-files" className={labelClass}>
          Archivos (opcional) Â· Files (optional)
        </label>
        <input
          id="owner-files"
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={onFilesChange}
          className="block w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[12px] text-[var(--col-espresso)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--col-gold)] file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-[var(--col-espresso)]"
        />
        <p className="mt-1 text-[11px] text-[var(--col-espresso-3)]/70">
          Up to 5 files. Images and PDF only.
        </p>

        {selectedFileNames.length > 0 ? (
          <ul className="mt-2 space-y-1 text-[11px] text-[var(--col-espresso-3)]/85">
            {selectedFileNames.map((filename) => (
              <li key={filename} className="rounded-md bg-[var(--col-parchment)]/60 px-2 py-1">
                {filename}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="owner-company">Company</label>
        <input
          id="owner-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting" || !isValid}
        className="btn-gold mt-6 w-full rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {status === "submitting" ? "Enviandoâ€¦ Â· Sendingâ€¦" : "Enviar solicitud Â· Send request"}
      </button>

      {status === "error" ? (
        <p className="mt-3 rounded-lg border border-[var(--col-terracotta)]/30 bg-[var(--col-terracotta)]/10 px-3 py-2 text-center text-[12px] font-semibold text-[var(--col-terracotta-2)]">
          {errorMessage || "No se pudo enviar la solicitud."}
        </p>
      ) : null}

      <div className="mt-4 rounded-lg border border-[var(--col-ceramic)]/25 bg-[var(--col-parchment)]/55 px-3 py-3 text-[11px] leading-relaxed text-[var(--col-espresso-3)]/80">
        <p>
          This form sends your request and uploaded files to Anthony by email. Files are stored only so
          Anthony can review them. Do not upload sensitive payment or personal customer information.
        </p>
        <p className="mt-2 italic">
          Este formulario envÃ­a su solicitud y archivos a Anthony por correo. Los archivos se guardan
          solo para que Anthony pueda revisarlos. No suba informaciÃ³n sensible de pagos ni datos
          personales de clientes.
        </p>
      </div>
    </form>
  );
}
