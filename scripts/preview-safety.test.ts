import assert from "node:assert/strict";
import test from "node:test";
import { isReadOnlyPreview } from "../src/lib/preview-safety";
import { ownerEnabled } from "../src/lib/owner/config";
import { recoveryConfig } from "../src/lib/owner/recovery";
import { getSupabaseAdmin, isRequestsDbEnabled, insertLead, insertRequest } from "../src/lib/supabaseServer";
import { POST as onboarding } from "../src/app/api/onboarding/route";
import { POST as ownerRequest } from "../src/app/api/owner-requests/route";

test("preview is explicitly read-only without changing production or local defaults", () => {
  assert.equal(isReadOnlyPreview({ VERCEL_ENV: "preview" }), true);
  for (const env of [{}, { VERCEL_ENV: "production" }, { VERCEL_ENV: "development" }]) assert.equal(isReadOnlyPreview(env), false);
  assert.equal(ownerEnabled({ OWNER_PORTAL_ENABLED: "true", VERCEL_ENV: "preview" }), false);
  assert.equal(ownerEnabled({ OWNER_PORTAL_ENABLED: "true", VERCEL_ENV: "production" }), true);
  assert.equal(ownerEnabled({}), false);
});

test("preview cannot enable password recovery even with inherited live flags", () => {
  assert.equal(recoveryConfig({ VERCEL_ENV: "preview", OWNER_PORTAL_ENABLED: "true", OWNER_RECOVERY_ENABLED: "true", OWNER_APP_ORIGIN: "https://live.example.test" }), null);
});

test("preview blocks CRM clients, writes, emails and uploads before reading submissions", async () => {
  const oldEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    Object.assign(process.env, { VERCEL_ENV: "preview", REQUESTS_DB_ENABLED: "true", SUPABASE_URL: "https://unused.example.test", SUPABASE_SERVICE_ROLE_KEY: "test-only-not-real", RESEND_API_KEY: "test-only-not-real", BLOB_READ_WRITE_TOKEN: "test-only-not-real", FROM_EMAIL: "test@example.test", OWNER_NOTIFICATION_EMAIL: "test@example.test" });
    globalThis.fetch = async () => { calls++; throw new Error("No external requests permitted in this test"); };
    assert.equal(getSupabaseAdmin(), null);
    assert.equal(isRequestsDbEnabled(), false);
    assert.equal(await insertLead({ cafe_name: "Synthetic" }), false);
    assert.equal(await insertRequest({ message: "Synthetic" }), false);
    for (const handler of [onboarding, ownerRequest]) {
      const request = new Request("https://preview.example.test/api/test", { method: "POST", body: "not even valid form data" });
      request.formData = async () => { throw new Error("Must not parse a preview submission"); };
      const response = await handler(request);
      assert.equal(response.status, 403);
      const body = await response.json();
      assert.equal(body.ok, false);
      assert.equal(body.reason, "read_only_preview");
      assert.match(body.detail, /Nothing was sent/);
    }
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in oldEnv)) delete process.env[key];
    Object.assign(process.env, oldEnv);
  }
});
