"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePassword, sendReset } from "@/app/owner-command-center/recovery/actions";
import type { RecoveryState } from "@/lib/owner/recovery";

const initial: RecoveryState = { error: "", message: "" };
const field = "rounded-lg border p-3";
const button = "rounded-lg bg-[#422819] p-3 font-semibold text-white disabled:opacity-50";

export function RequestPasswordReset() {
  const [state, action, pending] = useActionState(sendReset, initial);
  return <form action={action} className="mt-6 grid gap-4" aria-busy={pending}>
    <label className="grid gap-1">Account email<input className={field} name="email" type="email" autoComplete="username" required maxLength={254} /></label>
    <p className="text-sm">Use the email for your existing Colattao account. This does not create an account or grant owner access. Open the newest reset email on this device, in this browser.</p>
    <button disabled={pending} className={button}>{pending ? "Requesting link…" : "Email a reset link"}</button>
    <p role="status" className={state.error ? "text-sm text-red-800" : "text-sm"}>{state.error || state.message}</p>
  </form>;
}

export function SetOwnerPassword() {
  const [state, action, pending] = useActionState(savePassword, initial);
  if (state.done) return <section className="mt-6 grid gap-4"><p role="status">{state.message}</p><Link prefetch={false} href="/owner-command-center" className="underline">Return to sign-in</Link></section>;
  return <form action={action} className="mt-6 grid gap-4" aria-busy={pending}>
    <label className="grid gap-1">New password<input className={field} name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={256} /></label>
    <label className="grid gap-1">Confirm new password<input className={field} name="confirmation" type="password" autoComplete="new-password" required minLength={12} maxLength={256} /></label>
    <p className="text-sm">Use a unique passphrase of at least 12 characters. Saving will also request sign-out on your other devices. Save any open menu edits first. This changes your account password, not your menu or permissions.</p>
    <button disabled={pending} className={button}>{pending ? "Changing password…" : "Save new password"}</button>
    <p role="status" className="text-sm text-red-800">{state.error}</p>
  </form>;
}
