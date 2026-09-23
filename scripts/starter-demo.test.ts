import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DEMO_KEY, DEMO_MAX_BYTES, DEMO_TTL, demoIssues, readDemo, sampleDraft, saveDemo, validateDemo, validPrice, type DemoStorage } from "../src/lib/demo/model";

function storage(raw?: string): DemoStorage {
  const values = new Map<string, string>(raw ? [[DEMO_KEY, raw]] : []);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
}

test("fresh fictional sample is complete and independent of other drafts", () => {
  const first = sampleDraft(); first.items[0].name = "Changed";
  assert.equal(sampleDraft().items[0].name, "House latte");
  assert.deepEqual(demoIssues(sampleDraft()), []);
  assert.deepEqual(readDemo(storage()).draft, sampleDraft());
});

test("temporary drafts round-trip without losing incomplete work", () => {
  const draft = sampleDraft(); draft.businessName = ""; draft.items[0].price = "";
  const store = storage();
  assert.equal(saveDemo(store, draft, 1000), true);
  assert.deepEqual(readDemo(store, 1001).draft, draft);
  assert.equal(demoIssues(draft).length, 2);
});

test("expired and future drafts fall back without crashing", () => {
  for (const savedAt of [1000 - DEMO_TTL, 1001, "yesterday", null]) {
    const result = readDemo(storage(JSON.stringify({ savedAt, draft: { ...sampleDraft(), businessName: "Old" } })), 1000);
    assert.equal(result.draft.businessName, "Juniper Café");
    assert.match(result.message, /could not be restored/);
  }
});

test("corrupt, oversized and unrecognized storage is rejected", () => {
  for (const raw of ["{", "null", "[]", "x".repeat(DEMO_MAX_BYTES + 1), JSON.stringify({ savedAt: 1, draft: sampleDraft(), injected: true })]) {
    assert.deepEqual(readDemo(storage(raw), 2).draft, sampleDraft());
  }
});

test("unsupported versions, styles and injected fields are rejected", () => {
  for (const value of [{ ...sampleDraft(), version: 2 }, { ...sampleDraft(), style: "script" }, { ...sampleDraft(), businessId: "colattao" }, { ...sampleDraft(), businessName: "a\u0000b" }, { ...sampleDraft(), businessName: "a".repeat(81) }]) {
    assert.throws(() => validateDemo(value));
  }
});

test("item limits, duplicate IDs, types and unexpected item fields are enforced", () => {
  const item = sampleDraft().items[0];
  for (const items of [Array.from({ length: 21 }, (_, i) => ({ ...item, id: `id-${i}` })), [item, item], [{ ...item, available: "yes" }], [{ ...item, price: 5 }], [{ ...item, id: "<script>" }], [{ ...item, name: "a".repeat(81) }], [{ ...item, price: "1".repeat(9) }], [{ ...item, ownerId: "injected" }]]) {
    assert.throws(() => validateDemo({ ...sampleDraft(), items }));
  }
});

test("USD prices are bounded and cannot silently parse malformed amounts", () => {
  for (const value of ["0", "0.00", "5", "5.5", " 5.50 ", "99999.99"]) assert.equal(validPrice(value), true, value);
  for (const value of ["", "-1", "1e2", "NaN", "Infinity", "5.123", "$5", "5,00", "100000", "00.50", ".50"]) assert.equal(validPrice(value), false, value);
});

test("review requires a business name, complete items and an available item", () => {
  const draft = sampleDraft(); draft.businessName = " "; draft.items.forEach((item) => { item.available = false; });
  draft.items[0].name = ""; draft.items[1].price = "-1";
  assert.equal(demoIssues(draft).length, 4);
  assert.deepEqual(demoIssues({ ...sampleDraft(), items: [] }), ["Make at least one item available."]);
});

test("disabled or full storage never stops preview work", () => {
  const blocked: DemoStorage = { getItem() { throw new Error("Blocked"); }, setItem() { throw new Error("Full"); }, removeItem() { throw new Error("Blocked"); } };
  assert.deepEqual(readDemo(blocked).draft, sampleDraft());
  assert.equal(saveDemo(blocked, sampleDraft()), false);
});

test("demo storage never touches another business or owner draft", () => {
  const store = storage(); store.setItem("owner-private-draft", "private");
  saveDemo(store, sampleDraft(), 1000); readDemo(store, 1001);
  assert.equal(store.getItem("owner-private-draft"), "private");
});

test("Starter preview has no AI, banking, owner-data or billing client dependency", () => {
  const files = ["src/lib/demo/model.ts", "src/components/demo/StarterDemo.tsx", "src/app/demo/page.tsx"];
  for (const file of files) {
    const code = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(code, /(?:from\s*["'][^"']*(?:supabase|stripe|openai|resend|lib\/owner|colattaoMenu)|\bfetch\s*\(|\bXMLHttpRequest\b)/i, file);
  }
});
