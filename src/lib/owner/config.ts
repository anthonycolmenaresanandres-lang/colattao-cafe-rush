import { isReadOnlyPreview } from "../preview-safety";

export function ownerEnabled(env: Record<string, string | undefined> = process.env) {
  return !isReadOnlyPreview(env) && env.OWNER_PORTAL_ENABLED === "true";
}

export function ownerConnection() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Owner connection is not configured");
  return { url, key };
}
