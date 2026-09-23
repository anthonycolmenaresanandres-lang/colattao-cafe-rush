"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { changeMenu } from "@/app/owner-command-center/actions";
import { type EditableItem, type MenuDocument, type OwnerRole } from "@/lib/owner/menu-model";
import { DraftController } from "@/lib/owner/draft-controller";
import { decodeRecovery, encodeRecovery, recoveryKey } from "@/lib/owner/draft-recovery";
import { OwnerSignOut } from "./OwnerAuth";

type Props = {
  businessName: string; role: OwnerRole; publishedVersion: number | null;
  menu: MenuDocument; revision: number; publicEnabled: boolean; recoveryScope: string;
  history: { version: number; created_at: string; restored_from: number | null }[];
};
const button = "rounded-lg border border-[#8b603c] px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40";

export default function OwnerMenuEditor(props: Props) {
  const intentionalNavigation = useRef(false);
  const [confirmation, setConfirmation] = useState<{ operation: "publish" | "restore"; version?: number } | null>(null);
  const [controller] = useState(() => new DraftController(props, (...args) => new Promise((resolve, reject) => {
    startTransition(async () => { try { resolve(await changeMenu(...args)); } catch (error) { reject(error); } });
  })));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  const { menu, revision, version, status, blocked, dirty, recovery, phase, storageWarning } = state;
  const pending = phase !== "idle";
  const editable = props.role !== "viewer";
  const canPublish = props.role === "owner";
  const key = recoveryKey(props.recoveryScope);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      const recovered = decodeRecovery(raw, props.recoveryScope);
      if (raw && !recovered) controller.storageFailed();
      controller.offerRecovery(recovered);
    } catch { controller.storageFailed(); }
    const persist = () => {
      const current = controller.getSnapshot();
      if (current.recovery) return; // Never overwrite an unresolved recovery copy.
      try {
        if (current.dirty) sessionStorage.setItem(key, encodeRecovery(props.recoveryScope, current.revision, current.menu));
        else sessionStorage.removeItem(key);
      } catch { controller.storageFailed(); }
    };
    const unsubscribe = controller.subscribe(persist);
    controller.activate();
    return () => { unsubscribe(); controller.suspend(); };
  }, [controller, key, props.recoveryScope]);

  useEffect(() => {
    if (!dirty && !pending && !recovery) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (intentionalNavigation.current) return;
      event.preventDefault(); event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending, recovery]);

  function updateItem(id: string, changes: Partial<EditableItem>) { controller.editItem(id, changes); }
  function reloadSaved() {
    if (storageWarning && dirty && !window.confirm("Tab recovery is unavailable. Reloading discards unsaved edits. Copy anything you need before continuing.")) return;
    intentionalNavigation.current = true;
    window.location.reload();
  }
  async function run(operation: "save" | "publish" | "restore", restoreVersion?: number) {
    if (operation === "save") await controller.run("save");
    else setConfirmation({ operation, version: restoreVersion });
  }
  async function confirmPublication() {
    if (!confirmation) return;
    const selected = confirmation;
    setConfirmation(null);
    if (await controller.run(selected.operation, selected.version) && selected.operation === "restore") reloadSaved();
  }
  function beforeSignOut() {
    if (pending) return false;
    if ((dirty || recovery) && !window.confirm("Sign out and discard unsaved edits and the recovery copy in this tab?")) return false;
    try { sessionStorage.removeItem(key); } catch { controller.storageFailed(); }
    controller.suspend();
    intentionalNavigation.current = true;
    return true;
  }

  return <main className="mx-auto min-h-dvh max-w-4xl bg-[#fff8ed] px-4 py-8 text-[#332014] sm:px-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm uppercase tracking-widest">Owner portal</p><h1 className="mt-1 text-3xl font-bold">{props.businessName}</h1><p className="mt-2">Your menu, on your schedule.</p></div>
      <OwnerSignOut disabled={pending || !!confirmation} beforeSignOut={beforeSignOut} onFailure={() => { intentionalNavigation.current = false; controller.activate(); }} />
    </header>
    {!props.publicEnabled ? <p className="my-5 rounded-lg bg-amber-100 p-4">Setup mode: publishing here does not change the customer menu until delivery is enabled.</p> : null}
    <section className="sticky top-0 z-50 my-6 grid gap-3 rounded-xl border bg-[#fff8ed] p-4 shadow-sm" aria-label="Menu controls">
      <p className="text-sm">{dirty ? "Unsaved changes" : "Saved draft"} · Revision {revision} · Published version {version ?? "none"} · Role: {props.role}</p>
      <div className="flex flex-wrap gap-2">
        <button className={button} disabled={!editable || !dirty || pending || blocked || !!recovery} onClick={() => void run("save")}>{phase === "save" ? "Saving…" : pending ? "Working…" : "Save now"}</button>
        {!dirty && !pending && !blocked && !recovery ? <a className={button} href="/owner-command-center/preview" target="_blank" rel="noopener noreferrer">Preview saved draft ↗</a> : <button className={button} disabled>Save before preview</button>}
        <button className={`${button} bg-[#422819] text-white`} disabled={!canPublish || dirty || pending || blocked || !!recovery} onClick={() => void run("publish")}>Publish saved draft</button>
        <Link className={`${button} text-sm`} href="/menu" target="_blank">View customer menu ↗</Link>
      </div>
      <p role="status" aria-live="polite" className="text-sm">{status}</p>
      {blocked ? <button className={`${button} justify-self-start`} onClick={reloadSaved}>Reload to check saved version</button> : null}
      <p className="text-xs">Changes autosave to a private draft after you pause typing. Publishing is never automatic. A temporary recovery copy stays in this tab; do not rely on it after closing the tab.</p>
      {storageWarning ? <p role="alert" className="text-sm text-red-800">Tab recovery could not be read or stored. Keep this page open until your draft is confirmed saved.</p> : null}
    </section>
    {confirmation ? <section role="alertdialog" aria-label="Confirm menu publication" className="mb-6 rounded-xl border border-[#8b603c] bg-amber-50 p-4">
      <h2 className="text-xl font-bold">{confirmation.operation === "restore" ? `Restore version ${confirmation.version}?` : "Publish saved draft?"}</h2>
      <p className="my-3">{confirmation.operation === "restore" ? "This replaces the saved draft and creates a publication from the selected version. Existing history is kept." : props.publicEnabled ? "This updates the customer menu with your saved draft." : "This creates a publication for setup testing. Customer-menu delivery is still disabled."}</p>
      <div className="flex gap-2"><button className={`${button} bg-[#422819] text-white`} onClick={() => void confirmPublication()}>Confirm {confirmation.operation === "restore" ? "restore" : "publication"}</button><button className={button} onClick={() => setConfirmation(null)}>Cancel</button></div>
    </section> : null}
    {recovery ? <section className="mb-6 rounded-xl border border-amber-600 bg-amber-50 p-4" aria-label="Interrupted draft recovery">
      <h2 className="text-xl font-bold">Interrupted edits found</h2>
      <p className="my-3">{recovery.revision === revision ? "These edits were based on the current saved draft. Recover them or keep the server version." : "The server draft has changed since these edits. Automatic recovery is blocked to protect newer work. Copy anything you need from the recovery details before discarding."}</p>
      <div className="flex flex-wrap gap-2"><button className={button} disabled={!editable || recovery.revision !== revision} onClick={() => controller.recover()}>Recover edits</button><button className={button} onClick={() => { if (window.confirm("Discard the interrupted edits and keep the saved server draft?")) controller.discardRecovery(); }}>Keep server draft</button></div>
      <details className="mt-4"><summary className="cursor-pointer underline">View recovery details for copying</summary><label className="mt-2 grid gap-1">Recovered menu data<textarea readOnly rows={12} className="w-full rounded border bg-white p-2 font-mono text-xs" value={JSON.stringify(recovery.menu, null, 2)} /></label></details>
    </section> : null}
    <fieldset disabled={!editable || (pending && phase !== "save") || blocked || !!recovery || !!confirmation} className="grid gap-6 disabled:opacity-75">
      <legend className="mb-3 text-xl font-semibold">Edit menu items</legend>
      {menu.categories.map((category) => <section key={category.id} className="rounded-xl border p-4">
        <h2 className="mb-4 text-xl font-bold">{category.title}</h2>
        <div className="grid gap-5">{category.items.map((item) => <div key={item.id} className="grid gap-3 rounded-lg bg-white p-4 shadow-sm">
          <label className="grid gap-1 text-sm">Item name<input className="rounded border p-2 text-base" value={item.name} maxLength={150} onChange={(event) => updateItem(item.id, { name: event.target.value })} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Price / options<input className="rounded border p-2 text-base" value={item.price ?? ""} placeholder="Ask staff" maxLength={100} onChange={(event) => updateItem(item.id, { price: event.target.value || null })} /></label>
            <label className="flex items-center gap-3 self-end py-3"><input type="checkbox" checked={item.available} onChange={(event) => updateItem(item.id, { available: event.target.checked })} />Available</label>
          </div>
          <label className="grid gap-1 text-sm">Description<textarea className="rounded border p-2 text-base" value={item.description ?? ""} maxLength={1000} rows={2} onChange={(event) => updateItem(item.id, { description: event.target.value })} /></label>
          {item.needsConfirmation ? <p className="text-xs text-amber-900">Existing menu note: confirm this item with café staff.</p> : null}
        </div>)}</div>
      </section>)}
    </fieldset>
    <section className="mt-8 rounded-xl border p-4"><h2 className="text-xl font-bold">Publication history</h2><p className="mt-2 text-sm">Restoring keeps the history and replaces the draft. Only owners can publish or restore.</p>
      {props.history.length ? <ol className="mt-4 grid gap-3">{props.history.map((entry) => <li key={entry.version} className="flex flex-wrap items-center justify-between gap-3 border-t pt-3"><span>Version {entry.version} · {entry.created_at.slice(0, 16).replace("T", " ")} UTC{entry.restored_from ? ` · restored from ${entry.restored_from}` : ""}</span><button className={button} disabled={!canPublish || dirty || pending || blocked || !!recovery || version === entry.version} onClick={() => void run("restore", entry.version)}>Restore version {entry.version}</button></li>)}</ol> : <p className="mt-3">No published versions yet.</p>}
    </section>
  </main>;
}
