import assert from "node:assert/strict";
import test from "node:test";
import { changePassword, confirmRecovery, recoveryConfig, requestRecovery } from "../src/lib/owner/recovery";

const configured = { OWNER_PORTAL_ENABLED: "true", OWNER_RECOVERY_ENABLED: "true", OWNER_APP_ORIGIN: "https://owners.example.test", NODE_ENV: "production" };
const password = "a unique test passphrase";
const ok = { error: null };

test("recovery is off by default and needs both explicit flags", () => {
  assert.equal(recoveryConfig({}), null);
  assert.equal(recoveryConfig({ ...configured, OWNER_PORTAL_ENABLED: "false" }), null);
  assert.equal(recoveryConfig({ ...configured, OWNER_RECOVERY_ENABLED: "TRUE" }), null);
  assert.throws(() => recoveryConfig({ ...configured, OWNER_APP_ORIGIN: undefined }));
});

test("reset destination is a fixed trusted origin, never an open redirect", () => {
  assert.deepEqual(recoveryConfig(configured), { origin: "https://owners.example.test", callback: "https://owners.example.test/owner-command-center/recovery/confirm" });
  for (const origin of ["http://owners.example.test", "https://user:pass@owners.example.test", "https://owners.example.test/other", "https://owners.example.test?next=https://evil.test", "https://owners.example.test#fragment", "javascript:alert(1)", "//evil.test", "http://localhost:3000"]) assert.throws(() => recoveryConfig({ ...configured, OWNER_APP_ORIGIN: origin }));
  assert.equal(recoveryConfig({ ...configured, NODE_ENV: "development", OWNER_APP_ORIGIN: "http://127.0.0.1:3000" })?.origin, "http://127.0.0.1:3000");
  assert.throws(() => recoveryConfig({ ...configured, NODE_ENV: "development", OWNER_APP_ORIGIN: "http://remote.example.test" }));
});

test("disabled recovery and malformed emails make no provider calls", async () => {
  let calls = 0;
  const send = async () => { calls++; return ok; };
  assert.ok((await requestRecovery("owner@example.test", null, send)).error);
  for (const email of [null, new Blob(), "a", "a b@example.test", "a@b", "a".repeat(255) + "@example.test"]) assert.ok((await requestRecovery(email, "https://owners.example.test/reset", send)).error);
  assert.equal(calls, 0);
});

test("known and unknown email outcomes are identical and do not claim delivery", async () => {
  const sent: string[] = [];
  const send = async (email: string, callback: string) => { sent.push(email, callback); return ok; };
  const callback = recoveryConfig(configured)!.callback;
  const known = await requestRecovery(" owner@example.test ", callback, send);
  const unknown = await requestRecovery("unknown@example.test", callback, send);
  assert.deepEqual(known, unknown);
  assert.equal(known.error, "");
  assert.match(known.message, /If an account exists/);
  assert.equal(sent[0], "owner@example.test");
  assert.equal(sent[1], callback);
});

test("email transport/rate failures are truthful and never expose provider details", async () => {
  const failed = await requestRecovery("owner@example.test", "https://owners.example.test/reset", async () => ({ error: { code: "private-account-detail" } }));
  const thrown = await requestRecovery("owner@example.test", "https://owners.example.test/reset", async () => { throw new Error("SECRET"); });
  assert.deepEqual(failed, thrown);
  assert.match(failed.error, /could not be confirmed/);
  assert.doesNotMatch(JSON.stringify(failed), /SECRET|private-account-detail/);
});

test("invalid recovery codes cannot invoke exchange or authorization", async () => {
  let calls = 0;
  const ports = { exchange: async () => { calls++; return { error: null, data: { redirectType: "recovery" } }; }, authorize: async () => { calls++; }, signOut: async () => { calls++; } };
  for (const code of [null, "", "<script>", "a b", "a".repeat(2049)]) assert.equal(await confirmRecovery(code, true, ports), false);
  assert.equal(await confirmRecovery("valid-code", false, ports), false);
  assert.equal(calls, 0);
});

test("recovery exchanges the code then verifies membership", async () => {
  const events: string[] = [];
  assert.equal(await confirmRecovery("valid-code", true, {
    exchange: async (code) => { events.push(`exchange:${code}`); return { error: null, data: { redirectType: "recovery" } }; },
    authorize: async () => { events.push("authorize"); }, signOut: async () => { events.push("signout"); },
  }), true);
  assert.deepEqual(events, ["exchange:valid-code", "authorize"]);
});

test("expired, reused, wrong-flow and nonmember recovery links fail closed", async () => {
  for (const mode of ["expired", "wrong-flow", "revoked", "network"]) {
    const events: string[] = [];
    assert.equal(await confirmRecovery("valid-code", true, {
      exchange: async () => { if (mode === "network") throw new Error("offline"); return { error: mode === "expired" ? {} : null, data: { redirectType: mode === "wrong-flow" ? "signup" : "recovery" } }; },
      authorize: async () => { events.push("authorize"); throw new Error("No membership"); },
      signOut: async () => { events.push("signout"); throw new Error("Offline cleanup"); },
    }), false);
    assert.equal(events.includes("authorize"), mode === "revoked");
    assert.equal(events.at(-1), "signout");
  }
});

test("password validation prevents mutation, and never returns passwords", async () => {
  let calls = 0;
  const authorize = async () => { calls++; return { update: async () => ok, signOut: async () => ok }; };
  for (const value of [null, "short", " ".repeat(12), "a".repeat(257)]) assert.ok((await changePassword(value, value, true, authorize)).error);
  assert.ok((await changePassword(password, "different", true, authorize)).error);
  assert.ok((await changePassword(password, password, false, authorize)).error);
  assert.equal(calls, 0);
});

test("password update requires fresh authorization and never trusts prior UI state", async () => {
  const result = await changePassword(password, password, true, async () => { throw new Error("Revoked or expired"); });
  assert.match(result.error, /session or access could not be verified/);
  assert.equal(result.done, undefined);
});

test("password changes precede sign-out; returned state contains no credentials", async () => {
  const events: string[] = [];
  const result = await changePassword(password, password, true, async () => {
    events.push("authorize");
    return { update: async (value) => { assert.equal(value, password); events.push("update"); return ok; }, signOut: async () => { events.push("signout"); return ok; } };
  });
  assert.deepEqual(events, ["authorize", "update", "signout"]);
  assert.equal(result.done, true);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(password));
});

test("password policy rejection or uncertain write never falsely reports success", async () => {
  let signouts = 0;
  for (const code of ["weak_password", "same_password", "unknown"]) {
    const result = await changePassword(password, password, true, async () => ({ update: async () => ({ error: { code } }), signOut: async () => { signouts++; return ok; } }));
    assert.ok(result.error);
    assert.equal(result.done, undefined);
  }
  const lost = await changePassword(password, password, true, async () => ({ update: async () => { throw new Error("Lost acknowledgement"); }, signOut: async () => { signouts++; return ok; } }));
  assert.match(lost.error, /Try signing in with your new password/);
  assert.equal(signouts, 0);
});

test("a confirmed password change stays confirmed if session sign-out fails", async () => {
  const result = await changePassword(password, password, true, async () => ({ update: async () => ok, signOut: async () => ({ error: { code: "offline" } }) }));
  assert.equal(result.done, true);
  assert.equal(result.error, "");
  assert.match(result.message, /password was changed.*signing out existing sessions could not be confirmed/);
});
