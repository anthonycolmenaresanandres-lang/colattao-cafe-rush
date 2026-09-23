"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { OwnerAccessError, ownerClient, ownerContext } from "@/lib/owner/server";
import { validateMenu } from "@/lib/owner/menu-model";

export type AuthState = { error: string };
export type MenuResult = { ok: true; revision: number; version: number | null } | { ok: false; error: string; reloadRequired?: boolean };

export async function signIn(_previous: AuthState, form: FormData): Promise<AuthState> {
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email !== "string" || !email.includes("@") || email.length > 254 || typeof password !== "string" || !password || password.length > 256) return { error: "Enter your email and password." };
  try {
    const client = await ownerClient(true);
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: "Could not sign in. Check your details or try again shortly." };
    await ownerContext(true);
  } catch (error) {
    return { error: error instanceof OwnerAccessError ? error.message : "Sign-in is temporarily unavailable. Your menu has not changed." };
  }
  redirect("/owner-command-center");
}

export async function signOut(): Promise<AuthState> {
  try {
    const client = await ownerClient(true);
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return { error: "Sign-out could not be confirmed. Please try again." };
  } catch {
    return { error: "Sign-out could not be confirmed. Please try again." };
  }
  redirect("/owner-command-center");
}

export async function changeMenu(operation: "save" | "publish" | "restore", revision: number, content?: unknown, restoreVersion?: number): Promise<MenuResult> {
  try {
    const { client, business, role } = await ownerContext(true);
    if (role === "viewer" || (operation !== "save" && role !== "owner")) return { ok: false, error: "Your account cannot make this change." };
    if (!["save", "publish", "restore"].includes(operation) || !Number.isSafeInteger(revision) || revision < 1 || (operation === "restore" && (!Number.isSafeInteger(restoreVersion) || Number(restoreVersion) < 1))) return { ok: false, error: "Invalid change. Reload your saved draft." };
    let menu;
    if (operation === "save") {
      try { menu = validateMenu(content); } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Check your menu fields." }; }
    }
    const { data, error } = await client.rpc("owner_menu_write", {
      p_business: business.id, p_revision: revision, p_operation: operation,
      p_content: menu ?? null, p_restore: restoreVersion ?? null,
    });
    if (error) {
      if (error.code === "40001") return { ok: false, reloadRequired: true, error: "Someone saved a newer draft. Your changes are still here; copy anything you need before reloading." };
      if (error.code === "42501") return { ok: false, reloadRequired: true, error: "Your access has changed. Sign in again before continuing." };
      return { ok: false, reloadRequired: true, error: "The change was not confirmed. Keep this page open, then reload to check the saved version before retrying." };
    }
    if (!data || !Number.isSafeInteger(data.revision)) return { ok: false, reloadRequired: true, error: "The result could not be confirmed. Reload to check the saved version." };
    revalidatePath("/owner-command-center");
    if (operation !== "save") {
      updateTag("colattao-published-menu");
      revalidatePath("/menu");
    }
    return { ok: true, revision: data.revision, version: data.version };
  } catch (error) {
    return { ok: false, reloadRequired: true, error: error instanceof OwnerAccessError ? error.message : "Connection interrupted. Keep this page open; your edits have not been discarded. Reload to check the saved version before retrying." };
  }
}
