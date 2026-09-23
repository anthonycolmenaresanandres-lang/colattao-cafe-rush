import type { Metadata } from "next";
import Link from "next/link";
import { SetOwnerPassword } from "@/components/owner/OwnerRecovery";
import { recoveryAvailable } from "@/lib/owner/recovery";
import { ownerContext } from "@/lib/owner/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set your Colattao password", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function PasswordPage() {
  let allowed = false;
  if (recoveryAvailable()) {
    try { await ownerContext(); allowed = true; } catch { /* Do not render password form without verified membership. */ }
  }
  return <main className="mx-auto min-h-dvh max-w-lg bg-[#fff8ed] px-6 py-12 text-[#332014]">
    <h1 className="text-3xl font-bold">Set your password</h1>
    {allowed ? <SetOwnerPassword /> : <p className="mt-4">Your session or Colattao access could not be verified. Request a new reset link or sign in again.</p>}
    <Link prefetch={false} href="/owner-command-center/recovery" className="mt-6 block underline">Request a new reset link</Link>
    <Link prefetch={false} href="/owner-command-center" className="mt-4 block underline">Back to owner sign-in</Link>
  </main>;
}
