"use server";

import { redirect } from "next/navigation";
import { ownerClient, ownerContext } from "@/lib/owner/server";
import { changePassword, recoveryConfig, requestRecovery, type RecoveryState } from "@/lib/owner/recovery";

export async function sendReset(_previous: RecoveryState, form: FormData): Promise<RecoveryState> {
  let callback: string | null = null;
  try { callback = recoveryConfig()?.callback ?? null; } catch { /* Fail closed until configured. */ }
  return requestRecovery(form.get("email"), callback, async (email, redirectTo) => {
    const client = await ownerClient(true);
    return client.auth.resetPasswordForEmail(email, { redirectTo });
  });
}

export async function savePassword(_previous: RecoveryState, form: FormData): Promise<RecoveryState> {
  let enabled = false;
  try { enabled = recoveryConfig() !== null; } catch { /* Fail closed until configured. */ }
  const result = await changePassword(form.get("password"), form.get("confirmation"), enabled, async () => {
    // Never trust a user ID, email, role or previous action state sent by the browser.
    const { client } = await ownerContext(true);
    return {
      update: (password) => client.auth.updateUser({ password }),
      signOut: () => client.auth.signOut({ scope: "global" }),
    };
  });
  // Sign-out changes cookies and can unmount the form during RSC refresh.
  // A fixed status destination preserves the confirmed outcome across that navigation.
  if (result.done) redirect(`/owner-command-center/recovery?status=${result.sessionSignOutFailed ? "sessions" : "changed"}`);
  return result;
}
