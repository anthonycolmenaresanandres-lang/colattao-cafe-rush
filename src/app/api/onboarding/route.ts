import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { insertLead } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// New-café onboarding intake.
//
// Designed for door-to-door reps: a rep collects as much as possible on the
// spot, but a partial submission is NEVER blocked. Only the café name and one
// contact method are hard-required. Everything else is "capture if you can".
//
// The notification email lists exactly which recommended pieces are still
// missing, so Anthony has a clear follow-up checklist instead of a dead end.

const ALLOWED_PLAN_TYPES = new Set([
  "Menu only",
  "Menu + Game",
  "Multi-location",
  "Not sure yet",
]);

const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const MAX_TEXT_LEN = 6000;
const MAX_FILES = 12;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

// File inputs the form sends, each grouped + labeled in the email.
const FILE_GROUPS: Array<{ field: string; label: string }> = [
  { field: "menuFiles", label: "Menu (photo / PDF)" },
  { field: "logoFiles", label: "Logo" },
  { field: "photoFiles", label: "Storefront / hero photo" },
];

function cleanText(value: FormDataEntryValue | null, maxLen = MAX_TEXT_LEN) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function sanitizeFilename(filename: string) {
  return (
    filename
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "upload"
  );
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function missingEnvVars() {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.OWNER_NOTIFICATION_EMAIL) missing.push("OWNER_NOTIFICATION_EMAIL");
  if (!process.env.FROM_EMAIL) missing.push("FROM_EMAIL");
  return missing;
}

function validateFile(file: File) {
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return `Unsupported file type for "${file.name}". Allowed: images and PDF.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File "${file.name}" exceeds the 8MB limit.`;
  }
  return null;
}

function collectFiles(formData: FormData, field: string): File[] {
  return formData
    .getAll(field)
    .filter(
      (value): value is File =>
        typeof value === "object" &&
        value !== null &&
        "size" in value &&
        (value as File).size > 0 &&
        "name" in value,
    );
}

async function uploadGroup(label: string, files: File[]) {
  const timestamp = Date.now();
  const uploads = files.map((file, index) => {
    const safeName = sanitizeFilename(file.name || `${label}-${index + 1}`);
    const pathname = `onboarding/${timestamp}-${sanitizeFilename(label)}-${index + 1}-${safeName}`;
    return put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  });

  const settled = await Promise.allSettled(uploads);
  const urls = settled
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof put>>> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value.url);
  const failedCount = settled.length - urls.length;
  return { label, urls, failedCount };
}

export async function POST(request: Request) {
  const missing = missingEnvVars();
  if (missing.length > 0) {
    console.warn("[onboarding] Missing environment variables", { missing });
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_form_data" }, { status: 400 });
  }

  // Honeypot — silently accept bots without notifying.
  if (cleanText(formData.get("company"))) {
    return NextResponse.json({ ok: true, uploadedFileUrls: [] });
  }

  // --- Fields -------------------------------------------------------------
  const cafeName = cleanText(formData.get("cafeName"), 200);
  const contactInfo = cleanText(formData.get("contactInfo"), 300);
  const ownerName = cleanText(formData.get("ownerName"), 200);
  const ownerRole = cleanText(formData.get("ownerRole"), 120);
  const locationsCount = cleanText(formData.get("locationsCount"), 20);
  const addresses = cleanText(formData.get("addresses"), 1000);
  const hours = cleanText(formData.get("hours"), 600);
  const planType = cleanText(formData.get("planType"), 80);
  const gameAddon = cleanText(formData.get("gameAddon"), 10); // "yes" | "no" | ""
  const menuText = cleanText(formData.get("menuText"));
  const brandNotes = cleanText(formData.get("brandNotes"), 1500);
  const authorized = cleanText(formData.get("authorized"), 10) === "yes";
  const repName = cleanText(formData.get("repName"), 120);
  const repId = cleanText(formData.get("repId"), 120);
  const notes = cleanText(formData.get("notes"), 2000);
  const sourcePage = cleanText(formData.get("sourcePage"), 700) || "get-started";
  const submittedAt = new Date().toISOString();

  // --- Hard requirements (the only things that block submission) ----------
  if (!cafeName) {
    return NextResponse.json({ ok: false, reason: "missing_cafe_name" }, { status: 400 });
  }
  if (!contactInfo) {
    return NextResponse.json({ ok: false, reason: "missing_contact" }, { status: 400 });
  }
  if (planType && !ALLOWED_PLAN_TYPES.has(planType)) {
    return NextResponse.json({ ok: false, reason: "invalid_plan" }, { status: 400 });
  }

  // --- Files (grouped) ----------------------------------------------------
  const allFiles: File[] = FILE_GROUPS.flatMap((g) => collectFiles(formData, g.field));
  if (allFiles.length > MAX_FILES) {
    return NextResponse.json({ ok: false, reason: "too_many_files" }, { status: 400 });
  }
  for (const file of allFiles) {
    const err = validateFile(file);
    if (err) {
      return NextResponse.json(
        { ok: false, reason: "invalid_file", detail: err },
        { status: 400 },
      );
    }
  }

  const uploadedGroups: Array<{ label: string; urls: string[] }> = [];
  let uploadHadFailures = false;
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  if (allFiles.length > 0 && blobConfigured) {
    for (const group of FILE_GROUPS) {
      const groupFiles = collectFiles(formData, group.field);
      if (groupFiles.length === 0) continue;
      const result = await uploadGroup(group.label, groupFiles);
      if (result.failedCount > 0) uploadHadFailures = true;
      if (result.urls.length > 0) uploadedGroups.push({ label: result.label, urls: result.urls });
    }
  }

  // --- Completeness checklist → Anthony's follow-up list ------------------
  const hasMenu = Boolean(menuText) || uploadedGroups.some((g) => g.label.startsWith("Menu"));
  const hasLogo = uploadedGroups.some((g) => g.label === "Logo");

  const missingPieces: string[] = [];
  if (!ownerName) missingPieces.push("Owner / decision-maker name");
  if (!locationsCount) missingPieces.push("Number of locations");
  if (!addresses) missingPieces.push("Address(es)");
  if (!hours) missingPieces.push("Business hours");
  if (!planType) missingPieces.push("Plan / tier selection");
  if (!hasMenu) missingPieces.push("Menu (typed items or photo/PDF)");
  if (!hasLogo) missingPieces.push("Logo file");
  if (!authorized) missingPieces.push("Authorization to build & bill (owner confirmation)");

  const completeness =
    missingPieces.length === 0
      ? "COMPLETE — ready to build"
      : `NEEDS FOLLOW-UP — ${missingPieces.length} item(s) missing`;

  // --- Email --------------------------------------------------------------
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL!;
  const fromEmail = process.env.FROM_EMAIL!;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const planLabel = planType || "plan TBD";
  const repLabel = repName || repId || "self-serve";
  const subject = `New Café Signup — ${cafeName} — ${planLabel} — rep:${repLabel}`;

  const groupLinkLines = uploadedGroups.length
    ? uploadedGroups
        .map((g) => `${g.label}:\n${g.urls.map((u) => `  - ${u}`).join("\n")}`)
        .join("\n")
    : "- No files uploaded";

  const followUpBlock = missingPieces.length
    ? ["", "⚠ FOLLOW-UP NEEDED — collect from owner:", ...missingPieces.map((p) => `  - ${p}`)]
    : ["", "✅ Intake complete — nothing to follow up on."];

  const textBody = [
    "NEW CAFÉ ONBOARDING INTAKE",
    `Status: ${completeness}`,
    "",
    "— Business —",
    `Café name: ${cafeName}`,
    `Locations: ${locationsCount || "(missing)"}`,
    `Address(es): ${addresses || "(missing)"}`,
    `Hours: ${hours || "(missing)"}`,
    "",
    "— Contact —",
    `Owner / decision-maker: ${ownerName || "(missing)"}${ownerRole ? ` (${ownerRole})` : ""}`,
    `Email or phone: ${contactInfo}`,
    "",
    "— Plan —",
    `Tier: ${planType || "(missing)"}`,
    `Game add-on: ${gameAddon || "(not specified)"}`,
    `Authorized to build & bill: ${authorized ? "YES" : "NO / not confirmed"}`,
    "",
    "— Menu —",
    menuText ? menuText : "(no typed menu — see uploaded files if any)",
    "",
    "— Branding notes —",
    brandNotes || "(none)",
    "",
    "— Rep / source —",
    `Rep: ${repName || "(self-serve)"}`,
    `Rep ID / ref: ${repId || "(none)"}`,
    `Extra notes: ${notes || "(none)"}`,
    "",
    "— Uploaded files —",
    groupLinkLines,
    ...(uploadHadFailures
      ? ["", "Upload note: some files failed to upload — ask owner/rep to resend by email."]
      : []),
    ...(allFiles.length > 0 && !blobConfigured
      ? ["", "Upload note: files were attached but Blob storage is not configured."]
      : []),
    ...followUpBlock,
    "",
    `Source: ${sourcePage}`,
    `Submitted: ${submittedAt}`,
  ].join("\n");

  const followUpHtml = missingPieces.length
    ? `<div style="border:1px solid #c97b4a;background:#fdf1e8;padding:10px 14px;border-radius:8px;margin-top:12px;">
         <strong>⚠ Follow-up needed — collect from owner:</strong>
         <ul>${missingPieces.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
       </div>`
    : `<p style="color:#2e7d32;margin-top:12px;"><strong>✅ Intake complete — nothing to follow up on.</strong></p>`;

  const filesHtml = uploadedGroups.length
    ? uploadedGroups
        .map(
          (g) =>
            `<p style="margin:8px 0 2px;"><strong>${escapeHtml(g.label)}</strong></p><ul>${g.urls
              .map((u) => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`)
              .join("")}</ul>`,
        )
        .join("")
    : "<p>No files uploaded.</p>";

  const htmlBody = `
    <h2>New café onboarding intake</h2>
    <p><strong>Status:</strong> ${escapeHtml(completeness)}</p>
    <h3>Business</h3>
    <p><strong>Café name:</strong> ${escapeHtml(cafeName)}<br/>
       <strong>Locations:</strong> ${escapeHtml(locationsCount || "(missing)")}<br/>
       <strong>Address(es):</strong> ${escapeHtml(addresses || "(missing)")}<br/>
       <strong>Hours:</strong> ${escapeHtml(hours || "(missing)")}</p>
    <h3>Contact</h3>
    <p><strong>Owner / decision-maker:</strong> ${escapeHtml(ownerName || "(missing)")}${ownerRole ? ` (${escapeHtml(ownerRole)})` : ""}<br/>
       <strong>Email or phone:</strong> ${escapeHtml(contactInfo)}</p>
    <h3>Plan</h3>
    <p><strong>Tier:</strong> ${escapeHtml(planType || "(missing)")}<br/>
       <strong>Game add-on:</strong> ${escapeHtml(gameAddon || "(not specified)")}<br/>
       <strong>Authorized to build &amp; bill:</strong> ${authorized ? "YES" : "NO / not confirmed"}</p>
    <h3>Menu</h3>
    <p>${menuText ? escapeHtml(menuText).replaceAll("\n", "<br/>") : "(no typed menu — see uploaded files if any)"}</p>
    <h3>Branding notes</h3>
    <p>${brandNotes ? escapeHtml(brandNotes).replaceAll("\n", "<br/>") : "(none)"}</p>
    <h3>Rep / source</h3>
    <p><strong>Rep:</strong> ${escapeHtml(repName || "(self-serve)")}<br/>
       <strong>Rep ID / ref:</strong> ${escapeHtml(repId || "(none)")}<br/>
       <strong>Extra notes:</strong> ${notes ? escapeHtml(notes).replaceAll("\n", "<br/>") : "(none)"}</p>
    <h3>Uploaded files</h3>
    ${filesHtml}
    ${uploadHadFailures ? "<p><strong>Upload note:</strong> some files failed to upload — ask owner/rep to resend by email.</p>" : ""}
    ${followUpHtml}
    <hr/>
    <p style="color:#888;font-size:12px;">Source: ${escapeHtml(sourcePage)}<br/>Submitted: ${escapeHtml(submittedAt)}</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });
    if (error) {
      console.error("[onboarding] Email notification failed", error);
      return NextResponse.json({ ok: false, reason: "email_failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("[onboarding] Email notification failed", error);
    return NextResponse.json({ ok: false, reason: "email_failed" }, { status: 500 });
  }

  // Best-effort CRM persistence — never blocks or fails the response.
  void insertLead({
    cafe_name: cafeName,
    contact: contactInfo,
    contact_method: null,
    plan_type: planType || null,
    city: addresses ? addresses.split("\n")[0].trim() : null,
    notes: notes || null,
    source: "rep-intake",
    rep_id: repId || repName || null,
    missing_fields: missingPieces.length ? missingPieces : null,
    blob_url: uploadedGroups[0]?.urls[0] ?? null,
  });

  return NextResponse.json({
    ok: true,
    status: completeness,
    missingPieces,
  });
}
