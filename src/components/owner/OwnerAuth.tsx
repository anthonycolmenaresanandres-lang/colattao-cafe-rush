"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signOut } from "@/app/owner-command-center/actions";

export function OwnerSignIn({ recoveryEnabled = false }: { recoveryEnabled?: boolean }) {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  return <form action={action} className="mt-6 grid gap-4">
    <label className="grid gap-1">Email<input className="rounded-lg border p-3" name="email" type="email" autoComplete="username" required maxLength={254} /></label>
    <label className="grid gap-1">Password<input className="rounded-lg border p-3" name="password" type="password" autoComplete="current-password" required maxLength={256} /></label>
    <button disabled={pending} className="rounded-lg bg-[#422819] p-3 font-semibold text-white disabled:opacity-50">{pending ? "Signing in…" : "Sign in"}</button>
    <p role="status" className="text-sm text-red-800">{state.error}</p>
    {recoveryEnabled ? <Link prefetch={false} href="/owner-command-center/recovery" className="text-sm underline">Forgot your password?</Link> : null}
    <p className="text-sm">Access is invitation-only. {recoveryEnabled ? "If you need an account, contact your Colattao administrator." : "If you need an account or a password reset, contact your Colattao administrator."}</p>
    <Link href="/demo" prefetch={false} className="text-sm underline">Just exploring? Try a menu demo without an account.</Link>
  </form>;
}

export function OwnerSignOut({ beforeSignOut, onFailure, disabled = false }: { beforeSignOut?: () => boolean; onFailure?: () => void; disabled?: boolean } = {}) {
  const [state, action, pending] = useActionState(async () => {
    const result = await signOut();
    onFailure?.();
    return result;
  }, { error: "" });
  return <form action={action} onSubmit={(event) => { if (disabled || (beforeSignOut && !beforeSignOut())) event.preventDefault(); }}>
    <button disabled={pending || disabled} className="rounded-lg border px-4 py-2 disabled:opacity-50">{pending ? "Signing out…" : "Sign out"}</button>
    <p role="status" className="text-sm text-red-800">{state.error}</p>
  </form>;
}
