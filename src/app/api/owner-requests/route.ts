import { NextResponse } from "next/server";
import { getSupabaseAdmin, isRequestsDbEnabled } from "@/lib/supabaseServer";

// This handler performs a DB write — never cache it.
export const dynamic = "force-dynamic";

// Allowed request types (mirrors the form). Server-side allowlist.
const ALLOWED_TYPES = new Set([
  "Menú",
  "Precio",
  "Producto",
  "Foto",
  "Sticker",
  "Sitio web",
  "Juego",
  "Promoción",
  "Otro",
]);

// Spanish UI priority label -> canonical enum value.
const PRIORITY_MAP: Record<string, "low" | "normal" | "urgent"> = {
  Baja: "low",
  Normal: "normal",
  Urgente: "urgent",
};

const MAX_LEN = 4000;

function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_LEN);
}

type Payload = {
  requestType?: unknown;
  priority?: unknown;
  whatChanges?: unknown;
  currentSection?: unknown;
  newDetail?: unknown;
  notes?: unknown;
  contactName?: unknown;
  contactInfo?: unknown;
  sourcePage?: unknown;
  /** honeypot — must be empty for a real submission */
  company?: unknown;
};

export async function POST(request: Request) {
  // If the persisted flow isn't enabled/configured, tell the client to
  // fall back to demo behavior gracefully (no error noise).
  if (!isRequestsDbEnabled()) {
    return NextResponse.json(
      { ok: false, reason: "disabled" },
      { status: 503 },
    );
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_json" },
      { status: 400 },
    );
  }

  // Honeypot: real users never fill this hidden field.
  if (clean(body.company)) {
    // Pretend success to avoid tipping off bots; store nothing.
    return NextResponse.json({ ok: true, id: null });
  }

  const requestType = clean(body.requestType);
  const whatChanges = clean(body.whatChanges);
  const priorityLabel = clean(body.priority);
  const priority = PRIORITY_MAP[priorityLabel] ?? "normal";

  // Validation: required fields + allowed type.
  if (!requestType || !ALLOWED_TYPES.has(requestType)) {
    return NextResponse.json(
      { ok: false, reason: "invalid_request_type" },
      { status: 400 },
    );
  }
  if (!whatChanges) {
    return NextResponse.json(
      { ok: false, reason: "missing_what_changes" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, reason: "not_configured" },
      { status: 503 },
    );
  }

  const row = {
    tenant: "colattao",
    request_type: requestType,
    priority,
    what_changes: whatChanges,
    current_section: clean(body.currentSection) || null,
    new_detail: clean(body.newDetail) || null,
    notes: clean(body.notes) || null,
    contact_name: clean(body.contactName) || null,
    contact_info: clean(body.contactInfo) || null,
    source_page: clean(body.sourcePage) || "request-update",
    user_agent: (request.headers.get("user-agent") ?? "").slice(0, 512) || null,
  };

  const { data, error } = await supabase
    .from("owner_requests")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, reason: "insert_failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
