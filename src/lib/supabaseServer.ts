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
