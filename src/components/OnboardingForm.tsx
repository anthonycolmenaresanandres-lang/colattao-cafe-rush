"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "submitting" | "success" | "error";

const PLAN_TYPES = ["Menu only", "Menu + Game", "Multi-location", "Not sure yet"] as const;

const MAX_TOTAL_FILE_SIZE_BYTES = 16 * 1024 * 1024; // generous; server caps per-file at 8MB

const labelClass =
  "mb-1 block text-[10px] uppercase tracking-[0.22em] text-[var(--col-gold-deep)]";
const fieldClass =
  "w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/50 focus:border-[var(--col-gold-deep)]/70 focus:outline-none";
const sectionClass = "mt-6 border-t border-[var(--col-gold-deep)]/15 pt-5 first:mt-0 first:border-0 first:pt-0";
const sectionTitleClass =
  "mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--col-espresso)]";

function fileNames(files: File[]) {
  return files.map((f) => f.name);
}

export default function OnboardingForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";
  const repFromUrl = searchParams.get("rep") ?? "";

  // Business
  const [cafeName, setCafeName] = useState("");
  const [locationsCount, setLocationsCount] = useState("");
  const [addresses, setAddresses] = useState("");
  const [hours, setHours] = useState("");
  // Contact
  const [ownerName, setOwnerName] = useState("");
  const [ownerRole, setOwnerRole] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  // Plan
  const [planType, setPlanType] = useState<string>("");
  const [gameAddon, setGameAddon] = useState<"yes" | "no" | "">("");
  const [authorized, setAuthorized] = useState(false);
  // Menu + branding
  const [menuText, setMenuText] = useState("");
  const [brandNotes, setBrandNotes] = useState("");
  const [menuFiles, setMenuFiles] = useState<File[]>([]);
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  // Rep + notes
  const [repName, setRepName] = useState(repFromUrl);
  const [notes, setNotes] = useState("");
  // Honeypot
  const [company, setCompany] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValid = cafeName.trim() && contactInfo.trim();

  // Live follow-up hint so the rep can see what's still open — but submission
  // is never blocked by it.
  const stillMissing = useMemo(() => {
    const m: string[] = [];
    if (!ownerName.trim()) m.push("Owner name");
    if (!locationsCount.trim()) m.push("# of locations");
    if (!addresses.trim()) m.push("Address");
    if (!hours.trim()) m.push("Hours");
    if (!planType) m.push("Plan");
    if (!menuText.trim() && menuFiles.length === 0) m.push("Menu");
    if (logoFiles.length === 0) m.push("Logo");
    if (!authorized) m.push("Authorization");
    return m;
  }, [ownerName, locationsCount, addresses, hours, planType, menuText, menuFiles, logoFiles, authorized]);

  const onPickFiles =
    (setter: (files: File[]) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files ?? []);
      const total = selected.reduce((sum, f) => sum + f.size, 0);
      if (total > MAX_TOTAL_FILE_SIZE_BYTES) {
        setErrorMessage("Those files are too large. Try fewer or smaller files (8MB each max).");
        event.target.value = "";
        return;
      }
      setErrorMessage("");
      setter(selected);
    };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("cafeName", cafeName);
    formData.append("locationsCount", locationsCount);
    formData.append("addresses", addresses);
    formData.append("hours", hours);
    formData.append("ownerName", ownerName);
    formData.append("ownerRole", ownerRole);
    formData.append("contactInfo", contactInfo);
    formData.append("planType", planType);
    formData.append("gameAddon", gameAddon);
    formData.append("authorized", authorized ? "yes" : "no");
    formData.append("menuText", menuText);
    formData.append("brandNotes", brandNotes);
    formData.append("repName", repName);
    formData.append("repId", ref);
    formData.append("notes", notes);
    formData.append("sourcePage", window.location.href);
    formData.append("company", company);

    for (const file of menuFiles) formData.append("menuFiles", file);
    for (const file of logoFiles) formData.append("logoFiles", file);
    for (const file of photoFiles) formData.append("photoFiles", file);

    try {
      const response = await fetch("/api/onboarding", { method: "POST", body: formData });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; reason?: string; detail?: string }
        | null;

      if (response.ok && payload?.ok) {
        setStatus("success");
        return;
      }
      if (response.status === 503) {
        setErrorMessage("Service is not configured yet (Blob/Resend env vars missing).");
      } else {
        setErrorMessage(payload?.detail || "Could not submit. Please try again.");
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
        <p className="brand-eyebrow text-[var(--col-gold-deep)]">Intake submitted</p>
        <h2
          className="brand-wordmark mt-2 text-[24px] text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.02em" }}
        >
          Sent to Anthony
        </h2>
        <div className="ceramic-rule mx-auto my-4 w-2/3" />
        <p className="mx-auto max-w-md text-[13px] leading-relaxed text-[var(--col-espresso-3)]/85">
          The signup packet was emailed. Anthony will review and follow up on anything still missing.
        </p>
        {stillMissing.length > 0 ? (
          <p className="mx-auto mt-3 max-w-md rounded-lg bg-[var(--col-parchment)]/70 px-3 py-2 text-[12px] text-[var(--col-espresso-3)]/80">
            Still to collect later: {stillMissing.join(", ")}.
          </p>
        ) : (
          <p className="mx-auto mt-3 max-w-md text-[12px] italic text-[var(--col-espresso-3)]/70">
            Complete packet — nothing left to follow up on.
          </p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-ghost mt-6 rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em]"
        >
          Start another café
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="menu-card px-5 py-6 sm:px-7">
      {ref ? (
        <p className="mb-4 rounded-md bg-[var(--col-gold)]/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--col-gold-deep)]">
          Rep link · ref: {ref}
        </p>
      ) : null}

      {/* Business */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>1 · The café</p>
        <div>
          <label htmlFor="cafe-name" className={labelClass}>
            Café name <span className="text-[var(--col-terracotta-2)]">*</span>
          </label>
          <input
            id="cafe-name"
            type="text"
            value={cafeName}
            onChange={(e) => setCafeName(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Vessel Craft Coffee"
            required
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="locations" className={labelClass}>
              Number of locations
            </label>
            <input
              id="locations"
              type="text"
              inputMode="numeric"
              value={locationsCount}
              onChange={(e) => setLocationsCount(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 2"
            />
          </div>
          <div>
            <label htmlFor="hours" className={labelClass}>
              Hours
            </label>
            <input
              id="hours"
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={fieldClass}
              placeholder="Mon–Fri 7–4, etc."
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="addresses" className={labelClass}>
            Address(es)
          </label>
          <textarea
            id="addresses"
            value={addresses}
            onChange={(e) => setAddresses(e.target.value)}
            rows={2}
            className={fieldClass}
            placeholder="One per line if multiple locations"
          />
        </div>
      </div>

      {/* Contact */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>2 · Who decides</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="owner-name" className={labelClass}>
              Owner / decision-maker
            </label>
            <input
              id="owner-name"
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className={fieldClass}
              placeholder="Name"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="owner-role" className={labelClass}>
              Role
            </label>
            <input
              id="owner-role"
              type="text"
              value={ownerRole}
              onChange={(e) => setOwnerRole(e.target.value)}
              className={fieldClass}
              placeholder="Owner / manager"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="contact" className={labelClass}>
            Email or phone <span className="text-[var(--col-terracotta-2)]">*</span>
          </label>
          <input
            id="contact"
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className={fieldClass}
            placeholder="you@email.com / (555) 000-0000"
            autoComplete="off"
            required
          />
        </div>
      </div>

      {/* Plan */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>3 · Plan</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="plan" className={labelClass}>
              Tier
            </label>
            <select
              id="plan"
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className={fieldClass}
            >
              <option value="">— Select —</option>
              {PLAN_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="game-addon" className={labelClass}>
              Game add-on
            </label>
            <select
              id="game-addon"
              value={gameAddon}
              onChange={(e) => setGameAddon(e.target.value as "yes" | "no" | "")}
              className={fieldClass}
            >
              <option value="">— Not sure —</option>
              <option value="yes">Yes, include the game</option>
              <option value="no">No, menu only</option>
            </select>
          </div>
        </div>
        <label className="mt-4 flex items-start gap-2 text-[12px] leading-snug text-[var(--col-espresso)]">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--col-gold-deep)]"
          />
          <span>
            Owner authorizes Colattao Café Rush to build &amp; host their digital menu at the quoted
            setup + monthly price.
          </span>
        </label>
      </div>

      {/* Menu + branding */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>4 · Menu &amp; branding</p>
        <div>
          <label htmlFor="menu-text" className={labelClass}>
            Menu (type items, or upload a photo below)
          </label>
          <textarea
            id="menu-text"
            value={menuText}
            onChange={(e) => setMenuText(e.target.value)}
            rows={4}
            className={fieldClass}
            placeholder="Latte $5.50, Cappuccino $5.25 …"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="menu-files" className={labelClass}>
            Menu photo / PDF
          </label>
          <input
            id="menu-files"
            type="file"
            multiple
            accept="image/*,.pdf"
            capture="environment"
            onChange={onPickFiles(setMenuFiles)}
            className="block w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[12px] text-[var(--col-espresso)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--col-gold)] file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-[var(--col-espresso)]"
          />
          {menuFiles.length > 0 ? (
            <p className="mt-1 text-[11px] text-[var(--col-espresso-3)]/80">
              {fileNames(menuFiles).join(", ")}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="logo-files" className={labelClass}>
              Logo
            </label>
            <input
              id="logo-files"
              type="file"
              accept="image/*,.pdf"
              onChange={onPickFiles(setLogoFiles)}
              className="block w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[12px] text-[var(--col-espresso)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--col-gold)] file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-[var(--col-espresso)]"
            />
            {logoFiles.length > 0 ? (
              <p className="mt-1 text-[11px] text-[var(--col-espresso-3)]/80">
                {fileNames(logoFiles).join(", ")}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="photo-files" className={labelClass}>
              Storefront photo
            </label>
            <input
              id="photo-files"
              type="file"
              multiple
              accept="image/*"
              capture="environment"
              onChange={onPickFiles(setPhotoFiles)}
              className="block w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[12px] text-[var(--col-espresso)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--col-gold)] file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-[var(--col-espresso)]"
            />
            {photoFiles.length > 0 ? (
              <p className="mt-1 text-[11px] text-[var(--col-espresso-3)]/80">
                {fileNames(photoFiles).join(", ")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="brand-notes" className={labelClass}>
            Brand notes (colors, vibe)
          </label>
          <input
            id="brand-notes"
            type="text"
            value={brandNotes}
            onChange={(e) => setBrandNotes(e.target.value)}
            className={fieldClass}
            placeholder="Warm, earthy, gold accents…"
          />
        </div>
      </div>

      {/* Rep + notes */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>5 · Rep &amp; notes</p>
        <div>
          <label htmlFor="rep-name" className={labelClass}>
            Rep name {ref ? <span className="opacity-60">(ref: {ref})</span> : "(if in person)"}
          </label>
          <input
            id="rep-name"
            type="text"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            className={fieldClass}
            placeholder="Who collected this signup"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="notes" className={labelClass}>
            Notes for Anthony
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={fieldClass}
            placeholder="Anything else worth knowing…"
          />
        </div>
      </div>

      {/* Honeypot */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="company">Company</label>
        <input
          id="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {/* Live follow-up hint */}
      {stillMissing.length > 0 ? (
        <div className="mt-6 rounded-lg border border-[var(--col-terracotta)]/30 bg-[var(--col-terracotta)]/8 px-3 py-2.5 text-[12px] text-[var(--col-espresso-3)]/90">
          <span className="font-semibold">Not collected yet:</span> {stillMissing.join(", ")}.
          <span className="italic"> You can still submit — Anthony will follow up.</span>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-[var(--col-gold-deep)]/25 bg-[var(--col-gold)]/10 px-3 py-2.5 text-[12px] font-semibold text-[var(--col-gold-deep)]">
          Complete intake — ready to build.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !isValid}
        className="btn-gold mt-5 w-full rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {status === "submitting" ? "Submitting…" : "Submit intake"}
      </button>
      {!isValid ? (
        <p className="mt-2 text-center text-[11px] italic text-[var(--col-espresso-3)]/70">
          Café name and a contact are the only required fields.
        </p>
      ) : null}

      {status === "error" ? (
        <p className="mt-3 rounded-lg border border-[var(--col-terracotta)]/30 bg-[var(--col-terracotta)]/10 px-3 py-2 text-center text-[12px] font-semibold text-[var(--col-terracotta-2)]">
          {errorMessage || "Could not submit."}
        </p>
      ) : null}

      <div className="mt-4 rounded-lg border border-[var(--col-ceramic)]/25 bg-[var(--col-parchment)]/55 px-3 py-3 text-[11px] leading-relaxed text-[var(--col-espresso-3)]/80">
        This form emails the signup packet and uploaded files to Anthony. Files are stored only so he
        can build the café&apos;s menu. Do not upload payment details or personal customer data.
      </div>
    </form>
  );
}
