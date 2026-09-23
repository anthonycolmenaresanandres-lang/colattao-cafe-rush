import assert from "node:assert/strict";
import test from "node:test";
import { ownerFetch } from "../src/lib/owner/request";

test("owner requests bypass caching and preserve method/body", async () => {
  const controller = new AbortController();
  let calls = 0;
  await ownerFetch(async (_input, init) => {
    calls++;
    assert.equal(init?.cache, "no-store");
    assert.equal(init?.method, "POST");
    assert.equal(init?.body, "test-body");
    assert.equal(init?.signal, controller.signal);
    return new Response("ok");
  }, () => controller.signal)("https://fixture.invalid", { method: "POST", body: "test-body", cache: "force-cache" });
  assert.equal(calls, 1);
});

test("deadline interrupts a stalled request without retrying a write", async () => {
  const controller = new AbortController();
  let calls = 0;
  const response = ownerFetch(async (_input, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => { init!.signal!.addEventListener("abort", () => reject(new Error("deadline")), { once: true }); });
  }, () => controller.signal)("https://fixture.invalid", { method: "POST" });
  controller.abort();
  await assert.rejects(response, /deadline/);
  assert.equal(calls, 1);
});

test("caller cancellation is preserved alongside the deadline", async () => {
  for (const asRequest of [false, true]) {
    const caller = new AbortController();
    const deadline = new AbortController();
    let combined: AbortSignal | null | undefined;
    const fetcher = ownerFetch(async (_input, init) => { combined = init?.signal; return new Response(); }, () => deadline.signal);
    await fetcher(asRequest ? new Request("https://fixture.invalid", { signal: caller.signal }) : "https://fixture.invalid", asRequest ? undefined : { signal: caller.signal });
    assert.equal(combined?.aborted, false);
    caller.abort();
    assert.equal(combined?.aborted, true);
  }
});
