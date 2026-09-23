import type { OwnerRole } from "./menu-model";

export const DEFAULT_OWNER_BUSINESS = "colattao";
export class OwnerAccessError extends Error {}
export type OwnerBusiness = { id: string; slug: string; display_name: string; published_version: number | null };
export type AccessPorts = {
  // These ports are supplied by server code, never from form data or a browser token.
  verifiedUser: () => Promise<string | null>;
  businessBySlug: (slug: string) => Promise<unknown>;
  membership: (businessId: string, userId: string) => Promise<unknown>;
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function denied(): never { throw new OwnerAccessError("This account does not have access to this business."); }

export function businessSlug(value: unknown): string {
  // Reject ambiguous input; never normalize an invalid selection into another business.
  if (typeof value !== "string" || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value)) denied();
  return value;
}

/** Per-request authorization. A slug selects a business; it never grants ownership. */
export async function authorizeBusiness(selection: unknown, ports: AccessPorts) {
  const slug = businessSlug(selection);
  const userId = await ports.verifiedUser();
  if (!userId || !uuid.test(userId)) throw new OwnerAccessError("Please sign in again.");
  const found = await ports.businessBySlug(slug);
  if (!record(found) || found.slug !== slug || typeof found.id !== "string" || !uuid.test(found.id)) denied();
  const member = await ports.membership(found.id, userId);
  if (!record(member) || member.business_id !== found.id || member.user_id !== userId ||
      !["owner", "editor", "viewer"].includes(member.role as string)) denied();
  if (typeof found.display_name !== "string" || !found.display_name.trim() || found.display_name.length > 200 ||
      (found.published_version !== null && (!Number.isSafeInteger(found.published_version) || Number(found.published_version) < 1))) {
    throw new Error("Business configuration is not ready");
  }
  const business: OwnerBusiness = { id: found.id, slug, display_name: found.display_name, published_version: found.published_version as number | null };
  return { business, role: member.role as OwnerRole, userId, recoveryScope: `${business.id}:${userId}` };
}
