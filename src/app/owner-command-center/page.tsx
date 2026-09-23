import type { Metadata } from "next";
import Link from "next/link";
import OwnerDemo from "@/components/owner/OwnerDemo";
import { OwnerSignIn, OwnerSignOut } from "@/components/owner/OwnerAuth";
import OwnerMenuEditor from "@/components/owner/OwnerMenuEditor";
import { ownerEnabled } from "@/lib/owner/config";
import { recoveryAvailable } from "@/lib/owner/recovery";
import { OwnerAccessError, ownerWorkspace } from "@/lib/owner/server";

export const metadata: Metadata = { title: "Colattao Owner Portal", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OwnerPage() {
  if (!ownerEnabled()) return <OwnerDemo />;
  let workspace;
  try { workspace = await ownerWorkspace(); } catch (error) {
    return <main className="mx-auto min-h-dvh max-w-lg bg-[#fff8ed] px-6 py-12 text-[#332014]">
      <Link href="/menu" className="underline">Back to the menu</Link>
      <h1 className="mt-8 text-3xl font-bold">Colattao owner sign-in</h1>
      <p className="mt-3">{error instanceof OwnerAccessError ? error.message : "Owner setup or the connection is not ready. The public menu has not changed."}</p>
      <OwnerSignIn recoveryEnabled={recoveryAvailable()} /><OwnerSignOut />
    </main>;
  }
  return <OwnerMenuEditor key={`${workspace.recoveryScope}:${workspace.role}`} {...workspace} publicEnabled={process.env.OWNER_PUBLIC_MENU_ENABLED === "true"} />;
}
