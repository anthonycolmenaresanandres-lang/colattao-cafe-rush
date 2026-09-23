import "server-only";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { menuCategories } from "@/data/colattaoMenu";
import { ownerConnection } from "./config";
import { publicCategories, validateMenu } from "./menu-model";
import { isReadOnlyPreview } from "../preview-safety";

const publishedMenu = unstable_cache(async () => {
  const { url, key } = ownerConnection();
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5000), cache: "no-store" }) },
  });
  const { data, error } = await client.rpc("owner_public_menu", { p_slug: "colattao" });
  if (error || !data) throw new Error("Published menu is unavailable");
  return publicCategories(validateMenu(data.content));
}, ["colattao-published-menu-v1"], { revalidate: 60, tags: ["colattao-published-menu"] });

export async function publicMenu() {
  if (isReadOnlyPreview() || process.env.OWNER_PUBLIC_MENU_ENABLED !== "true") return { categories: menuCategories };
  try { return { categories: await publishedMenu() }; } catch {
    console.error("[owner-menu] published snapshot unavailable; showing labelled reference menu");
    return {
      categories: menuCategories.map((category) => ({ ...category, items: category.items.map((item) => ({ ...item, price: null })) })),
      warning: "Live menu updates are temporarily unavailable. This is a reference menu; please confirm prices and availability with staff.",
    };
  }
}
