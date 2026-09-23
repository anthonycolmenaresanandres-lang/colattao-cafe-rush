import assert from "node:assert/strict";
import test from "node:test";
import { authorizeBusiness, businessSlug, DEFAULT_OWNER_BUSINESS, OwnerAccessError, type AccessPorts } from "../src/lib/owner/access";

const user = "10000000-0000-4000-8000-000000000001";
const otherUser = "10000000-0000-4000-8000-000000000002";
const first = { id: "00000000-0000-4000-8000-000000000001", slug: "colattao", display_name: "Colattao", published_version: 1 };
const second = { id: "00000000-0000-4000-8000-000000000002", slug: "juniper", display_name: "Fictional Juniper", published_version: null };
function fixture() {
  const calls: string[] = [];
  const roles = new Map([[first.id, "owner"], [second.id, "viewer"]]);
  const ports: AccessPorts = {
    verifiedUser: async () => { calls.push("user"); return user; },
    businessBySlug: async (slug) => { calls.push(`business:${slug}`); return [first, second].find((business) => business.slug === slug) ?? null; },
    membership: async (businessId, userId) => { calls.push(`member:${businessId}:${userId}`); return roles.has(businessId) ? { business_id: businessId, user_id: userId, role: roles.get(businessId) } : null; },
  };
  return { ports, calls, roles };
}

test("legacy default stays Colattao; explicit selection resolves only that business", async () => {
  assert.equal(DEFAULT_OWNER_BUSINESS, "colattao");
  const { ports, calls } = fixture();
  const result = await authorizeBusiness("juniper", ports);
  assert.equal(result.business.id, second.id);
  assert.equal(result.role, "viewer");
  assert.deepEqual(calls, ["user", "business:juniper", `member:${second.id}:${user}`]);
});

test("invalid or ambiguous slugs fail before any identity or database call", async () => {
  const { ports, calls } = fixture();
  for (const selection of [null, undefined, {}, [], "", " colattao", "Colattao", "colattao/other", "../colattao", "a".repeat(64), "-cafe", "cafe-", "café", "colattao%00"]) await assert.rejects(authorizeBusiness(selection, ports), OwnerAccessError);
  assert.deepEqual(calls, []);
  assert.equal(businessSlug("a"), "a");
  assert.equal(businessSlug("a".repeat(63)), "a".repeat(63));
});

test("missing or malformed verified identity cannot query business data", async () => {
  for (const identity of [null, "", "browser-claimed-user"]) {
    const { ports, calls } = fixture(); ports.verifiedUser = async () => identity;
    await assert.rejects(authorizeBusiness("colattao", ports), /sign in again/);
    assert.deepEqual(calls, []);
  }
});

test("missing business and missing membership return the same non-enumerating denial", async () => {
  const { ports, roles } = fixture(); roles.delete(second.id);
  for (const slug of ["unknown", "juniper"]) await assert.rejects(authorizeBusiness(slug, ports), { message: "This account does not have access to this business." });
});

test("a provider response for another slug or malformed ID is not accepted", async () => {
  for (const value of [first, { ...second, id: "not-a-uuid" }, [second]]) {
    const { ports, calls } = fixture(); ports.businessBySlug = async () => value;
    await assert.rejects(authorizeBusiness("juniper", ports), OwnerAccessError);
    assert.deepEqual(calls, ["user"]);
  }
});

test("membership must match both selected business and verified user", async () => {
  for (const membership of [{ business_id: second.id, user_id: user, role: "owner" }, { business_id: first.id, user_id: otherUser, role: "owner" }, { role: "owner" }]) {
    const { ports } = fixture(); ports.membership = async () => membership;
    await assert.rejects(authorizeBusiness("colattao", ports), OwnerAccessError);
  }
});

test("unknown roles deny access; valid roles are never upgraded", async () => {
  const { ports, roles } = fixture();
  for (const role of ["owner", "editor", "viewer"]) {
    roles.set(first.id, role); assert.equal((await authorizeBusiness("colattao", ports)).role, role);
  }
  for (const role of ["admin", "Owner", "", "__proto__"]) {
    roles.set(first.id, role); await assert.rejects(authorizeBusiness("colattao", ports), OwnerAccessError);
  }
});

test("revocation and role changes are rechecked on every request", async () => {
  const { ports, roles } = fixture();
  assert.equal((await authorizeBusiness("colattao", ports)).role, "owner");
  roles.set(first.id, "viewer"); assert.equal((await authorizeBusiness("colattao", ports)).role, "viewer");
  roles.delete(first.id); await assert.rejects(authorizeBusiness("colattao", ports), OwnerAccessError);
});

test("provider failures do not fallback to another business or prior permission", async () => {
  for (const operation of ["verifiedUser", "businessBySlug", "membership"] as const) {
    const { ports } = fixture(); ports[operation] = async () => { throw new Error("Provider unavailable"); };
    await assert.rejects(authorizeBusiness("juniper", ports), /Provider unavailable/);
  }
});

test("malformed business metadata and unsafe publication revisions fail closed", async () => {
  for (const value of [{ ...first, display_name: "" }, { ...first, published_version: 0 }, { ...first, published_version: "1" }, { ...first, published_version: Number.MAX_SAFE_INTEGER + 1 }]) {
    const { ports } = fixture(); ports.businessBySlug = async () => value;
    await assert.rejects(authorizeBusiness("colattao", ports), /configuration is not ready/);
  }
});

test("recovery scopes cannot collide between businesses or signed-in users", async () => {
  const { ports } = fixture();
  const firstScope = (await authorizeBusiness("colattao", ports)).recoveryScope;
  const secondScope = (await authorizeBusiness("juniper", ports)).recoveryScope;
  ports.verifiedUser = async () => otherUser;
  const thirdScope = (await authorizeBusiness("colattao", ports)).recoveryScope;
  assert.equal(new Set([firstScope, secondScope, thirdScope]).size, 3);
});
