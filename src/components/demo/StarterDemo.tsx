"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DEMO_MAX_ITEMS, DEMO_STYLES, demoIssues, readDemo, sampleDraft, saveDemo, validPrice, type DemoDraft, type DemoItem } from "@/lib/demo/model";
import styles from "./starter-demo.module.css";

const steps = ["Your look", "Your menu", "Review"];
const labels = { parchment: "Warm parchment", ceramic: "Soft ceramic", espresso: "Deep espresso" };

export default function StarterDemo() {
  const [draft, setDraft] = useState<DemoDraft>(sampleDraft);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState("Loading your temporary preview…");
  const [storageOk, setStorageOk] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [removed, setRemoved] = useState<{ item: DemoItem; index: number } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const newItem = useRef<HTMLInputElement>(null);
  const focusNewItem = useRef(false);

  useEffect(() => {
    let active = true;
    // Reading after hydration keeps the server and initial client markup identical.
    queueMicrotask(() => {
      if (!active) return;
      try {
        const restored = readDemo(window.sessionStorage);
        setDraft(restored.draft);
        setNotice(restored.message);
      } catch { setStorageOk(false); setNotice("Temporary storage is unavailable. You can still try the preview."); }
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const flush = () => {
      try { saveDemo(window.sessionStorage, draft); } catch { /* Already explained by the storage warning. */ }
    };
    window.addEventListener("pagehide", flush);
    const timer = window.setTimeout(() => {
      try { setStorageOk(saveDemo(window.sessionStorage, draft)); }
      catch { setStorageOk(false); }
    }, 250);
    return () => { window.clearTimeout(timer); window.removeEventListener("pagehide", flush); };
  }, [draft, ready]);

  useEffect(() => {
    if (focusNewItem.current) { newItem.current?.focus(); focusNewItem.current = false; }
  }, [draft.items.length]);

  function go(next: number) {
    setStep(next);
    setConfirmReset(false);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function updateItem(id: string, change: Partial<DemoItem>) {
    setDraft((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, ...change } : item) }));
  }
  function addItem() {
    if (draft.items.length >= DEMO_MAX_ITEMS) return;
    focusNewItem.current = true;
    setDraft((current) => ({ ...current, items: [...current.items, { id: crypto.randomUUID(), name: "", price: "", available: true }] }));
  }
  function download() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "my-menu-demo.json"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Draft download requested. This file is a backup, not a published menu.");
  }
  const issues = demoIssues(draft);
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/" prefetch={false} className={styles.wordmark}>Colattao</Link>
      <Link href="/owner-command-center" prefetch={false}>Owner sign-in</Link>
    </header>
    <section className={styles.intro}>
      <p className={styles.eyebrow}>STARTER · INTERACTIVE DEMO</p>
      <h1>A little preview.<br />A lot more you.</h1>
      <p>Make this sample menu your own. No email. No card. No AI generation.</p>
      <p className={styles.note}>Juniper Café and its products are fictional examples. This demo does not change any live business.</p>
    </section>
    <div className={styles.layout}>
      <section className={styles.editor} aria-label="Personalize your demo">
        <nav aria-label="Demo steps" className={styles.steps}>{steps.map((label, index) =>
          <button key={label} disabled={!ready} aria-current={step === index ? "step" : undefined} onClick={() => go(index)}>{index + 1}. {label}</button>)}</nav>
        <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>
        <a href="#demo-preview" className={styles.previewLink}>See my menu preview ↓</a>
        <fieldset disabled={!ready} className={styles.fields}>
          <legend className={styles.srOnly}>{steps[step]} settings</legend>
          {step === 0 && <>
            <label>Business name<input maxLength={80} value={draft.businessName} onChange={(event) => setDraft({ ...draft, businessName: event.target.value })} autoComplete="off" /></label>
            <fieldset className={styles.looks}><legend>Choose a ready-made style</legend>{DEMO_STYLES.map((style) =>
              <label key={style}><input type="radio" name="demo-style" checked={draft.style === style} onChange={() => setDraft({ ...draft, style })} />{labels[style]}</label>)}</fieldset>
            <p className={styles.note}>No logo or photos needed to start. These styles use typography and color, not generated artwork.</p>
            <button className={styles.primary} onClick={() => go(1)}>Make it mine →</button>
          </>}
          {step === 1 && <>
            <p className={styles.note}>Replace the examples with your items. Prices are in USD. Unavailable items stay out of the preview.</p>
            {draft.items.map((item, index) => <fieldset key={item.id} className={styles.item}>
              <legend>Item {index + 1}</legend>
              <label>Item name<input ref={index === draft.items.length - 1 ? newItem : undefined} maxLength={80} value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} /></label>
              <label>Price (USD)<input inputMode="decimal" maxLength={8} value={item.price} aria-invalid={item.price !== "" && !validPrice(item.price)} onChange={(event) => updateItem(item.id, { price: event.target.value })} /></label>
              {item.price !== "" && !validPrice(item.price) && <p className={styles.error}>Use a price like 5.00, without a dollar sign.</p>}
              <div className={styles.itemActions}><label><input type="checkbox" checked={item.available} onChange={(event) => updateItem(item.id, { available: event.target.checked })} />Available</label>
                <button aria-label={`Remove item ${index + 1}`} onClick={() => {
                  setRemoved({ item, index });
                  setDraft({ ...draft, items: draft.items.filter((entry) => entry.id !== item.id) });
                  setNotice(`${item.name || "Item"} removed. You can undo the last removal.`);
                }}>Remove</button></div>
            </fieldset>)}
            <button onClick={addItem} disabled={draft.items.length >= DEMO_MAX_ITEMS}>+ Add an item ({draft.items.length}/{DEMO_MAX_ITEMS})</button>
            {removed && <button disabled={draft.items.length >= DEMO_MAX_ITEMS} onClick={() => {
              const items = [...draft.items]; items.splice(removed.index, 0, removed.item);
              setDraft({ ...draft, items }); setRemoved(null); setNotice("Item restored.");
            }}>Undo last removal</button>}
            <button className={styles.primary} onClick={() => go(2)}>Review my preview →</button>
          </>}
          {step === 2 && <>
            {issues.length ? <div className={styles.error}><h3>A few details to finish</h3><ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul><button onClick={() => go(!draft.businessName.trim() ? 0 : 1)}>Fix these details</button></div> : <p>Your menu preview is ready to review.</p>}
            <div className={styles.callout}><h3>Preview only — not published</h3><p>The planned Starter is $99/month with ready-made styles and no AI generation. Online signup, billing and publishing are not enabled here. Nothing will be charged.</p></div>
            <button className={styles.primary} onClick={download}>Download my draft</button>
            <p className={styles.note}>A JSON backup for safekeeping. Importing this file and transferring a demo to a real account are not available yet.</p>
            <Link href="/" prefetch={false}>Try the existing Colattao game ↗</Link>
            <p className={styles.note}>That is a separate Colattao example; your demo branding does not change the game.</p>
          </>}
        </fieldset>
        <p role="status" className={styles.status}>{notice}</p>
        <p className={styles.note}>{storageOk ? "Edits are saved automatically in this browser tab, temporarily. They can be restored for up to 24 hours after the last save; browser settings or closing the tab may clear them." : "Your browser could not save a temporary copy. Keep this page open and download your draft from Review before leaving."} No draft is sent to an owner account.</p>
        {confirmReset ? <div className={styles.callout}><p>Replace your demo edits with the fictional sample? Download your draft first if you want to keep it.</p><div className={styles.itemActions}><button onClick={() => { setDraft(sampleDraft()); setRemoved(null); setConfirmReset(false); setNotice("Demo reset to the fictional sample."); go(0); }}>Yes, reset demo</button><button onClick={() => setConfirmReset(false)}>Keep my edits</button></div></div> : <button className={styles.reset} disabled={!ready} onClick={() => setConfirmReset(true)}>Start over</button>}
      </section>
      <aside id="demo-preview" tabIndex={-1} className={styles.previewWrap} aria-label="Live menu preview">
        <p className={styles.eyebrow}>YOUR PREVIEW · NOT LIVE</p>
        <div className={`${styles.preview} ${styles[draft.style]}`}>
          <p className={styles.eyebrow}>THE MENU</p>
          <h2>{draft.businessName.trim() || "Your business name"}</h2>
          <div className={styles.rule} />
          {draft.items.filter((item) => item.available).map((item) => <div key={item.id} className={styles.menuRow}><span>{item.name.trim() || "Your item name"}</span><span>{validPrice(item.price) ? `$${Number(item.price).toFixed(2)}` : "Add price"}</span></div>)}
          {!draft.items.some((item) => item.available) && <p>No available items yet. Add an item or mark one available.</p>}
          <p className={styles.previewFooter}>Made yours, simply.</p>
        </div>
        <p className={styles.note}>Text updates as you type. This is a menu preview, not an ordering or payment page.</p>
      </aside>
    </div>
    <noscript>This interactive demo needs JavaScript. The regular Colattao menu is still available at /menu.</noscript>
  </main>;
}
