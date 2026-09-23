import { menuCategories, type MenuCategory } from "../../data/colattaoMenu";

export type EditableItem = MenuCategory["items"][number] & {
  id: string;
  sourceName: string;
  available: boolean;
};
export type EditableCategory = Omit<MenuCategory, "items"> & { items: EditableItem[] };
export type MenuDocument = { schemaVersion: 1; categories: EditableCategory[] };
export type OwnerRole = "owner" | "editor" | "viewer";
export const MAX_MENU_BYTES = 200_000;

export function initialMenu(): MenuDocument {
  return {
    schemaVersion: 1,
    categories: menuCategories.map((category) => ({
      ...category,
      items: category.items.map((item, index) => ({
        ...item,
        id: `${category.id}-${index + 1}`,
        sourceName: item.name,
        available: true,
      })),
    })),
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function string(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

/** Treat even database content as untrusted before rendering or publishing it. */
export function validateMenu(value: unknown, options: { allowIncompleteNames?: boolean } = {}): MenuDocument {
  if (!record(value) || !keys(value, ["schemaVersion", "categories"]) || value.schemaVersion !== 1 || !Array.isArray(value.categories) || value.categories.length < 1 || value.categories.length > 30) {
    throw new Error("The menu format is invalid. Reload your saved draft.");
  }
  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_MENU_BYTES) throw new Error("The menu is too large.");
  const categoryIds = new Set<string>();
  const itemIds = new Set<string>();
  for (const category of value.categories) {
    if (!record(category) || !keys(category, ["id", "title", "note", "items"]) || !string(category.id, 1, 80) || !/^[a-z0-9-]+$/.test(category.id) || categoryIds.has(category.id) || !string(category.title, 1, 100) || (category.note !== undefined && !string(category.note, 0, 500)) || !Array.isArray(category.items) || category.items.length > 100) {
      throw new Error("Check category names and items; each category needs a unique ID.");
    }
    categoryIds.add(category.id);
    for (const item of category.items) {
      if (!record(item) || !keys(item, ["id", "name", "sourceName", "price", "description", "needsConfirmation", "available"]) || !string(item.id, 1, 100) || !/^[a-z0-9-]+$/.test(item.id) || itemIds.has(item.id) || !string(item.name, options.allowIncompleteNames ? 0 : 1, 150) || !string(item.sourceName, 1, 150) || !(item.price === null || string(item.price, 1, 100)) || typeof item.available !== "boolean" || (item.description !== undefined && !string(item.description, 0, 1000)) || (item.needsConfirmation !== undefined && typeof item.needsConfirmation !== "boolean")) {
        throw new Error("Check item names, prices and descriptions; each item needs a unique ID.");
      }
      itemIds.add(item.id);
    }
  }
  return value as MenuDocument;
}

export function publicCategories(menu: MenuDocument): EditableCategory[] {
  return menu.categories.map((category) => ({ ...category, items: category.items.filter((item) => item.available) })).filter((category) => category.items.length > 0);
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
