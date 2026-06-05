import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (Phase 1 — owner request save).
 *
 * Uses the SERVICE ROLE key, which must NEVER be exposed to the browser.
 * This module must only be imported from server code (the owner-requests
 * Route Handler). The service-role key is read from process.env and never
 * reaches the client bundle.
 *
 * Returns null when env vars are not configured so callers can degrade
 * gracefully (e.g. when REQUESTS_DB_ENABLED is off or in local dev).
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}

/** Whether the persisted request flow is enabled (env-flag + configured). */
export function isRequestsDbEnabled(): boolean {
  return (
    process.env.REQUESTS_DB_ENABLED === "true" &&
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

/** Sales lead row (mirrors public.leads in supabase/migrations/0001_crm.sql). */
export interface LeadRow {
  cafe_name: string;
  contact?: string | null;
  contact_method?: string | null;
  plan_type?: string | null;
  city?: string | null;
  notes?: string | null;
  source?: string | null;
  rep_id?: string | null;
  missing_fields?: string[] | null;
  blob_url?: string | null;
  client_slug?: string;
}

/** Client request row (mirrors public.requests in supabase/migrations/0001_crm.sql). */
export interface RequestRow {
  request_type?: string | null;
  priority?: string | null;
  message?: string | null;
  contact?: string | null;
  blob_url?: string | null;
  client_slug?: string;
}

/**
 * Best-effort lead insert. Returns true only on a confirmed write. No-ops
 * (returns false) when the CRM flow is disabled/unconfigured, and SWALLOWS all
 * errors — it must NEVER throw or block the calling Route Handler's response.
 */
export async function insertLead(row: LeadRow): Promise<boolean> {
  if (!isRequestsDbEnabled()) return false;
  const db = getSupabaseAdmin();
  if (!db) return false;
  try {
    const { error } = await db.from("leads").insert(row);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Best-effort request insert. Same contract as insertLead: never throws, never
 * blocks; returns false when disabled/unconfigured or on any error.
 */
export async function insertRequest(row: RequestRow): Promise<boolean> {
  if (!isRequestsDbEnabled()) return false;
  const db = getSupabaseAdmin();
  if (!db) return false;
  try {
    const { error } = await db.from("requests").insert(row);
    return !error;
  } catch {
    return false;
  }
}

/** Stored lead (LeadRow + DB-generated columns). */
export interface LeadRecord extends LeadRow {
  id: string;
  created_at: string;
  status: string;
}

/** Stored request (RequestRow + DB-generated columns). */
export interface RequestRecord extends RequestRow {
  id: string;
  created_at: string;
  status: string;
}

/**
 * Read helpers for the internal /crm dashboard. Server-only (service-role).
 * Return [] when disabled/unconfigured or on any error — never throw.
 */
export async function fetchLeads(limit = 200): Promise<LeadRecord[]> {
  if (!isRequestsDbEnabled()) return [];
  const db = getSupabaseAdmin();
  if (!db) return [];
  try {
    const { data, error } = await db
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as LeadRecord[];
  } catch {
    return [];
  }
}

export async function fetchRequests(limit = 200): Promise<RequestRecord[]> {
  if (!isRequestsDbEnabled()) return [];
  const db = getSupabaseAdmin();
  if (!db) return [];
  try {
    const { data, error } = await db
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as RequestRecord[];
  } catch {
    return [];
  }
}
