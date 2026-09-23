import assert from "node:assert/strict";
import { test } from "node:test";
import { DraftController, type DraftResult, type MenuMutation, type Scheduler } from "../src/lib/owner/draft-controller";
import { decodeRecovery, encodeRecovery, RECOVERY_LIFETIME, recoveryKey } from "../src/lib/owner/draft-recovery";
import { initialMenu, type MenuDocument, type OwnerRole } from "../src/lib/owner/menu-model";

function fakeClock() {
  let now = 0;
  const jobs = new Set<{ at: number; callback: () => void }>();
  const schedule: Scheduler = (callback, delay) => { const job = { at: now + delay, callback }; jobs.add(job); return () => { jobs.delete(job); }; };
  async function tick(ms: number) {
    now += ms;
    for (const job of Array.from(jobs).sort((a, b) => a.at - b.at)) if (jobs.has(job) && job.at <= now) { jobs.delete(job); job.callback(); }
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
  return { schedule, tick, jobs };
}
function setup(mutate: MenuMutation, role: OwnerRole = "owner") {
  const clock = fakeClock();
  const controller = new DraftController({ menu: initialMenu(), revision: 1, publishedVersion: 1, role, publicEnabled: false }, mutate, clock.schedule);
  controller.activate();
  return { controller, clock, id: initialMenu().categories[0].items[0].id };
}
const price = (controller: DraftController) => controller.getSnapshot().menu.categories[0].items[0].price;

test("autosave waits for a typing pause and sends only the latest snapshot", async () => {
  const calls: Parameters<MenuMutation>[] = [];
  const { controller, clock, id } = setup(async (...args) => { calls.push(args); return { ok: true, revision: 2, version: 1 }; });
  controller.editItem(id, { price: "$5" });
  await clock.tick(1000);
  assert.equal(calls.length, 0);
  controller.editItem(id, { price: "$5.50" });
  await clock.tick(1199);
  assert.equal(calls.length, 0);
  await clock.tick(1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "save");
  assert.equal((calls[0][2] as MenuDocument).categories[0].items[0].price, "$5.50");
  assert.equal(controller.getSnapshot().dirty, false);
  assert.equal(controller.getSnapshot().revision, 2);
});

test("typing during a save is retained and the next save uses the acknowledged revision", async () => {
  const calls: Parameters<MenuMutation>[] = [];
  const completions: ((result: DraftResult) => void)[] = [];
  const { controller, clock, id } = setup((...args) => { calls.push(args); return new Promise((resolve) => completions.push(resolve)); });
  controller.editItem(id, { price: "$5" });
  await clock.tick(1200);
  controller.editItem(id, { price: "$6" });
  await clock.tick(1200);
  assert.equal(calls.length, 1);
  assert.equal(await controller.run("save"), false, "manual save cannot overlap autosave");
  assert.equal(await controller.run("publish"), false, "cannot publish while saving");
  completions[0]({ ok: true, revision: 2, version: 1 });
  await clock.tick(0);
  assert.equal(price(controller), "$6");
  assert.equal(controller.getSnapshot().dirty, true);
  await clock.tick(1200);
  assert.equal(calls.length, 2);
  assert.equal(calls[1][1], 2);
  assert.equal((calls[1][2] as MenuDocument).categories[0].items[0].price, "$6");
  completions[1]({ ok: true, revision: 3, version: 1 });
  await clock.tick(0);
  assert.equal(controller.getSnapshot().dirty, false);
});

test("manual save cancels its pending autosave and does not publish", async () => {
  const calls: string[] = [];
  const { controller, clock, id } = setup(async (operation) => { calls.push(operation); return { ok: true, revision: 2, version: 1 }; });
  controller.editItem(id, { available: false });
  assert.equal(await controller.run("save"), true);
  await clock.tick(5000);
  assert.deepEqual(calls, ["save"]);
});

test("invalid fields pause autosave without a retry loop and can be corrected", async () => {
  let count = 0;
  const { controller, clock, id } = setup(async () => { count++; return { ok: true, revision: 2, version: 1 }; });
  controller.editItem(id, { name: "" });
  await clock.tick(1200);
  assert.equal(controller.getSnapshot().paused, true);
  assert.equal(controller.getSnapshot().blocked, false);
  await clock.tick(60000);
  assert.equal(count, 0);
  controller.editItem(id, { name: "Pumpkin Latte" });
  await clock.tick(1200);
  assert.equal(count, 1);
  assert.equal(controller.getSnapshot().dirty, false);
});

test("conflicts preserve edits and stop all retries and publication", async () => {
  let count = 0;
  const { controller, clock, id } = setup(async () => { count++; return { ok: false, reloadRequired: true, error: "Draft changed" }; });
  controller.editItem(id, { price: "$7" });
  await clock.tick(1200);
  assert.equal(price(controller), "$7");
  assert.equal(controller.getSnapshot().blocked, true);
  await clock.tick(60000);
  assert.equal(await controller.run("save"), false);
  assert.equal(await controller.run("publish"), false);
  assert.equal(count, 1);
});

test("unconfirmed timed-out requests block retries; late success cannot erase edits", async () => {
  let complete!: (result: DraftResult) => void;
  const { controller, clock, id } = setup(() => new Promise((resolve) => { complete = resolve; }));
  controller.editItem(id, { price: "$8" });
  await clock.tick(1200);
  controller.editItem(id, { price: "$9" });
  await clock.tick(30000);
  assert.equal(controller.getSnapshot().blocked, true);
  assert.equal(controller.getSnapshot().phase, "idle");
  complete({ ok: true, revision: 2, version: 1 });
  await clock.tick(0);
  assert.equal(price(controller), "$9");
  assert.equal(controller.getSnapshot().revision, 1);
  assert.equal(controller.getSnapshot().dirty, true);
});

test("network errors and malformed acknowledgements never claim a save succeeded", async () => {
  for (const mutate of [async () => { throw new Error("offline"); }, async () => ({ ok: true as const, revision: 1, version: 1 })]) {
    const { controller, id } = setup(mutate);
    controller.editItem(id, { price: "$10" });
    assert.equal(await controller.run("save"), false);
    assert.equal(controller.getSnapshot().blocked, true);
    assert.equal(controller.getSnapshot().dirty, true);
    controller.suspend();
  }
});

test("viewer cannot edit or save; editor cannot publish or restore", async () => {
  let count = 0;
  for (const role of ["viewer", "editor"] as const) {
    const { controller, id } = setup(async () => { count++; return { ok: true, revision: 2, version: 1 }; }, role);
    assert.equal(await controller.run("publish"), false);
    assert.equal(await controller.run("restore", 1), false);
    controller.editItem(id, { price: "$11" });
    if (role === "viewer") { assert.equal(controller.getSnapshot().dirty, false); assert.equal(await controller.run("save"), false); }
    controller.suspend();
  }
  assert.equal(count, 0);
});

test("unmount cancels queued autosave, remount resumes safely", async () => {
  let count = 0;
  const { controller, clock, id } = setup(async () => { count++; return { ok: true, revision: 2, version: 1 }; });
  controller.editItem(id, { price: "$12" });
  controller.suspend();
  await clock.tick(1200);
  assert.equal(count, 0);
  controller.activate();
  await clock.tick(1200);
  assert.equal(count, 1);
});

test("recovery requires user choice and matching server revision", async () => {
  let count = 0;
  const { controller, clock } = setup(async () => { count++; return { ok: true, revision: 2, version: 1 }; });
  const menu = initialMenu(); menu.categories[0].items[0].price = "$13";
  const recovery = decodeRecovery(encodeRecovery("cafe:user", 1, menu), "cafe:user")!;
  controller.offerRecovery(recovery);
  await clock.tick(5000);
  assert.equal(count, 0);
  assert.equal(await controller.run("publish"), false);
  assert.equal(controller.recover(), true);
  await clock.tick(1200);
  assert.equal(count, 1);
  assert.equal(price(controller), "$13");
  const stale = { ...recovery, revision: 1, menu: initialMenu() };
  controller.offerRecovery(stale);
  assert.equal(controller.recover(), false);
  await clock.tick(5000);
  assert.equal(count, 1);
  controller.discardRecovery();
  assert.equal(controller.getSnapshot().recovery, null);
  assert.equal(price(controller), "$13");
});

test("recovery rejects expired, malformed, cross-account and unexpected data", () => {
  const now = 10_000_000_000;
  const raw = encodeRecovery("cafe:user", 1, initialMenu(), now);
  assert.equal(decodeRecovery(raw, "cafe:another-user", now), null);
  assert.equal(decodeRecovery(raw, "other-cafe:user", now), null);
  assert.equal(decodeRecovery(raw, "cafe:user", now + RECOVERY_LIFETIME + 1), null);
  assert.equal(decodeRecovery("{bad", "cafe:user", now), null);
  assert.equal(decodeRecovery(raw.replace('"schemaVersion":1', '"schemaVersion":999'), "cafe:user", now), null);
  const invalid = JSON.parse(raw); invalid.menu.categories[0].items[0].image = "javascript:alert(1)";
  assert.equal(decodeRecovery(JSON.stringify(invalid), "cafe:user", now), null);
  assert.notEqual(recoveryKey("cafe:user"), recoveryKey("cafe:another-user"));
});

test("recovery preserves incomplete typing but normal save validation still rejects it", async () => {
  const menu = initialMenu(); menu.categories[0].items[0].name = "";
  const recovery = decodeRecovery(encodeRecovery("cafe:user", 1, menu), "cafe:user");
  assert.ok(recovery);
  let count = 0;
  const { controller, clock } = setup(async () => { count++; return { ok: true, revision: 2, version: 1 }; });
  controller.offerRecovery(recovery);
  controller.recover();
  await clock.tick(1200);
  assert.equal(count, 0);
  assert.equal(controller.getSnapshot().menu.categories[0].items[0].name, "");
  assert.equal(controller.getSnapshot().paused, true);
});
