"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OnboardingForm from "@/components/OnboardingForm";

// Soft access gate so café customers who stumble onto /get-started can't use
// the rep intake. This is NOT hard security — the code ships in the client
// bundle. It only keeps the page out of casual reach. The page is also
// noindex'd and never linked from any customer-facing surface.
//
// Reps receive links with the code pre-filled: /get-started?ref=maria&key=CODE
// so they never have to type it in the field.
const ACCESS_CODE = process.env.NEXT_PUBLIC_REP_ACCESS_CODE || "1234";
const STORAGE_KEY = "colattao_rep_unlocked";

export default function RepIntakeGate() {
  const searchParams = useSearchParams();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const keyParam = searchParams.get("key");
    if (keyParam && keyParam === ACCESS_CODE) {
      setUnlocked(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* sessionStorage unavailable — non-fatal */
      }
      return;
    }
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      setUnlocked(true);
      setError("");
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    setError("Incorrect access code.");
  };

  if (unlocked) {
    return <OnboardingForm />;
  }

  return (
    <section className="menu-card px-6 py-10 text-center">
      <p className="brand-eyebrow text-[var(--col-gold-deep)]">Restricted</p>
      <h2
        className="brand-wordmark mt-2 text-[22px] text-[var(--col-espresso)]"
        style={{ letterSpacing: "0.02em" }}
      >
        Sales rep access only
      </h2>
      <div className="ceramic-rule mx-auto my-4 w-1/2" />
      <p className="mx-auto max-w-sm text-[12.5px] leading-relaxed text-[var(--col-espresso-3)]/80">
        This signup tool is for Colattao Café Rush reps. Enter your access code to continue.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto mt-5 max-w-xs space-y-3">
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          autoComplete="off"
          className="w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2.5 text-center text-[13px] tracking-[0.12em] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/45 focus:border-[var(--col-gold-deep)]/70 focus:outline-none"
        />
        {error ? (
          <p className="text-[12px] font-semibold text-[var(--col-terracotta-2)]">{error}</p>
        ) : null}
        <button
          type="submit"
          className="btn-gold w-full rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em]"
        >
          Unlock intake
        </button>
      </form>
    </section>
  );
}
