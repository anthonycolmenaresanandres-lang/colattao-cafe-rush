import Link from "next/link";
import { notFound } from "next/navigation";
import MenuView from "@/components/MenuView";
import { ownerEnabled } from "@/lib/owner/config";
import { ownerWorkspace } from "@/lib/owner/server";
import { publicCategories } from "@/lib/owner/menu-model";

export const dynamic = "force-dynamic";
export const metadata = { title: "Private menu preview", robots: { index: false, follow: false } };

export default async function PreviewPage() {
  if (!ownerEnabled()) notFound();
  let workspace;
  try { workspace = await ownerWorkspace(); } catch {
    return <main className="p-8"><h1>Private preview unavailable</h1><p>Sign in with an authorized account, or retry when your connection returns.</p><Link href="/owner-command-center" className="underline">Back to owner portal</Link></main>;
  }
  return <>
    <aside className="bg-amber-100 p-4 text-center text-amber-950">Private saved-draft preview · revision {workspace.revision}. Not live. <Link href="/owner-command-center" className="underline">Back to editing</Link></aside>
    <MenuView preview menuCategories={publicCategories(workspace.menu)} />
  </>;
}
