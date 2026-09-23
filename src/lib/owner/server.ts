import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ownerConnection, ownerEnabled } from "./config";
import { validateMenu } from "./menu-model";
import { ownerFetch } from "./request";
import { authorizeBusiness, businessSlug, DEFAULT_OWNER_BUSINESS, OwnerAccessError } from "./access";
export { OwnerAccessError } from "./access";

export async function ownerClient(writable = false) {
  if (!ownerEnabled()) throw new OwnerAccessError("Owner editing is not enabled yet.");
  const { url, key } = ownerConnection();
  const jar = await cookies();
  return createServerClient(url, key, {
    global: { fetch: ownerFetch() },
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        // Proxy refreshes during reads; only actions/route handlers write cookies here.
        if (writable) for (const { name, value, options } of values) jar.set(name, value, options);
      },
    },
  });
}

export async function ownerContext(writable = false, selection: unknown = DEFAULT_OWNER_BUSINESS) {
  const slug = businessSlug(selection);
  const client = await ownerClient(writable);
  return authorizeOwner(client, slug);
}

// Reuse the request's client after a recovery-code exchange, including its new session.
export async function authorizeOwner(client: Awaited<ReturnType<typeof ownerClient>>, selection: unknown = DEFAULT_OWNER_BUSINESS) {
  const access = await authorizeBusiness(selection, {
    verifiedUser: async () => {
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) return null;
      return user.id;
    },
    businessBySlug: async (slug) => {
      const result = await client.from("owner_businesses").select("id, slug, display_name, published_version").eq("slug", slug).maybeSingle();
      if (result.error) throw new Error("Owner database unavailable");
      return result.data;
    },
    membership: async (businessId, userId) => {
      const result = await client.from("owner_memberships").select("business_id, user_id, role").eq("business_id", businessId).eq("user_id", userId).maybeSingle();
      if (result.error) throw new Error("Membership check unavailable");
      return result.data;
    },
  });
  return { client, ...access };
}

export async function ownerWorkspace(selection: unknown = DEFAULT_OWNER_BUSINESS) {
  const context = await ownerContext(false, selection);
  const [draft, history] = await Promise.all([
    context.client.from("owner_menu_drafts").select("content, revision, updated_at").eq("business_id", context.business.id).single(),
    context.client.from("owner_menu_publications").select("version, created_at, restored_from").eq("business_id", context.business.id).order("version", { ascending: false }).limit(20),
  ]);
  if (draft.error || history.error) throw new Error("Menu setup is not ready");
  return {
    businessName: context.business.display_name as string,
    recoveryScope: context.recoveryScope,
    role: context.role,
    publishedVersion: context.business.published_version as number | null,
    menu: validateMenu(draft.data.content),
    revision: draft.data.revision as number,
    history: history.data as { version: number; created_at: string; restored_from: number | null }[],
  };
}
