import type { Metadata } from "next";
import Link from "next/link";
import { RequestPasswordReset } from "@/components/owner/OwnerRecovery";
import { recoveryAvailable } from "@/lib/owner/recovery";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recover your Colattao account", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function RecoveryPage({ searchParams }: { searchParams: Promise<{ error?: string; status?: string }> }) {
  const params = await searchParams;
  const failed = params.error === "link";
  const changed = params.status === "changed" || params.status === "sessions";
  return <main className="mx-auto min-h-dvh max-w-lg bg-[#fff8ed] px-6 py-12 text-[#332014]">
    <Link prefetch={false} href="/owner-command-center" className="underline">Back to owner sign-in</Link>
    <h1 className="mt-8 text-3xl font-bold">Recover your account</h1>
    {changed ? <p role="status" className="mt-4">{params.status === "sessions" ? "Your password was changed, but signing out existing sessions could not be confirmed. Contact your administrator if another device may have access." : "Your password was changed. Sign in with your new password. Existing access tokens may remain valid until they expire."}</p> : null}
    {failed ? <p role="alert" className="mt-3">This link could not be verified. It may have expired, already been used, or opened in a different browser. Request a new link here. If your account has no Colattao access, contact your administrator.</p> : null}
    {!changed && (recoveryAvailable() ? <RequestPasswordReset /> : <p className="mt-4">Self-service password recovery is not configured yet. Contact your Colattao administrator. The public menu is still available.</p>)}
    <Link href="/menu" className="mt-6 block underline">View the public menu</Link>
  </main>;
}
