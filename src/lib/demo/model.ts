// Standalone fictional preview. Never import live owner data or provider clients here.
export const DEMO_KEY = "colattao:starter-demo:v1";
export const DEMO_TTL = 24 * 60 * 60 * 1000;
export const DEMO_MAX_ITEMS = 20;
export const DEMO_MAX_BYTES = 24_000;
export const DEMO_STYLES = ["parchment", "ceramic", "espresso"] as const;
export type DemoStyle = (typeof DEMO_STYLES)[number];
export type DemoItem = { id: string; name: string; price: string; available: boolean };
export type DemoDraft = { version: 1; businessName: string; style: DemoStyle; items: DemoItem[] };

export function sampleDraft(): DemoDraft {
  return { version: 1, businessName: "Juniper Café", style: "parchment", items: [
    { id: "sample-1", name: "House latte", price: "5.00", available: true },
    { id: "sample-2", name: "Butter croissant", price: "4.00", available: true },
    { id: "sample-3", name: "Iced tea", price: "3.50", available: true },
  ] };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
function shortText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
}

// Incomplete fields can be saved while typing; readiness is checked separately.
export function validateDemo(value: unknown): DemoDraft {
  if (!record(value) || !exactKeys(value, ["version", "businessName", "style", "items"]) ||
      value.version !== 1 || !shortText(value.businessName, 80) ||
      !DEMO_STYLES.includes(value.style as DemoStyle) || !Array.isArray(value.items) ||
      value.items.length > DEMO_MAX_ITEMS) throw new Error("Invalid demo draft");
  const ids = new Set<string>();
  const items = value.items.map((item): DemoItem => {
    if (!record(item) || !exactKeys(item, ["id", "name", "price", "available"]) ||
        typeof item.id !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(item.id) || ids.has(item.id) ||
        !shortText(item.name, 80) || !shortText(item.price, 8) || typeof item.available !== "boolean") {
      throw new Error("Invalid demo item");
    }
    ids.add(item.id);
    return { id: item.id, name: item.name, price: item.price, available: item.available };
  });
  return { version: 1, businessName: value.businessName, style: value.style as DemoStyle, items };
}

export function validPrice(price: string): boolean {
  return /^(0|[1-9]\d{0,4})(\.\d{1,2})?$/.test(price.trim());
}
export function demoIssues(draft: DemoDraft): string[] {
  const issues: string[] = [];
  if (!draft.businessName.trim()) issues.push("Add your business name.");
  if (!draft.items.some((item) => item.available)) issues.push("Make at least one item available.");
  draft.items.forEach((item, index) => {
    if (!item.name.trim()) issues.push(`Item ${index + 1}: add a name.`);
    if (!validPrice(item.price)) issues.push(`Item ${index + 1}: enter a USD price, such as 5.00.`);
  });
  return issues;
}

export type DemoStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function readDemo(storage: DemoStorage, now = Date.now()): { draft: DemoDraft; message: string } {
  try {
    const raw = storage.getItem(DEMO_KEY);
    if (!raw) return { draft: sampleDraft(), message: "Fictional sample ready to personalize." };
    if (new TextEncoder().encode(raw).length > DEMO_MAX_BYTES) throw new Error("Too large");
    const saved: unknown = JSON.parse(raw);
    if (!record(saved) || !exactKeys(saved, ["savedAt", "draft"]) || typeof saved.savedAt !== "number" ||
        !Number.isFinite(saved.savedAt) || saved.savedAt > now || now - saved.savedAt >= DEMO_TTL) throw new Error("Expired draft");
    return { draft: validateDemo(saved.draft), message: "Your temporary draft was restored in this tab." };
  } catch {
    // Never trust browser storage; a damaged draft must not stop the demo.
    return { draft: sampleDraft(), message: "The previous draft could not be restored. A fresh sample is ready." };
  }
}
export function saveDemo(storage: DemoStorage, draft: DemoDraft, now = Date.now()): boolean {
  try {
    storage.setItem(DEMO_KEY, JSON.stringify({ savedAt: now, draft: validateDemo(draft) }));
    return true;
  } catch { return false; }
}
