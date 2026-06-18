"use client";

import { FormEvent, useState } from "react";
import MarketBoard from "@/components/MarketBoard";

// Light PIN gate, same pattern as the owner command center. Not real auth —
// just keeps the internal money/pay/risk view off a casually-shared link.
const OPS_PIN = "1234";

const SHELL =
  "min-h-dvh bg-[radial-gradient(circle_at_20%_10%,#2e5a7c22_0%,transparent_36%),radial-gradient(circle_at_80%_15%,#d990281f_0%,transparent_30%),linear-gradient(180deg,#120904_0%,#1b0e08_45%,#2a1208_100%)] px-4 py-8 text-[#fff3d6] sm:px-6";

export default function OpsBoard() {
  const [pin, setPin] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pin.trim() === OPS_PIN) {
      setAuthorized(true);
      setError("");
      return;
    }
    setError("Incorrect PIN. Try again.");
  };

  if (!authorized) {
    return (
      <main className={SHELL}>
        <div className="mx-auto w-full max-w-md">
          <section className="rounded-3xl border border-[#f5c46b33] bg-[#1b0e08]/75 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#92aecd]">Internal board</p>
            <h1 className="mt-3 font-serif text-3xl text-[#fff3d6]">Colattao Community Market</h1>
            <p className="mt-2 text-sm text-[#f4deba]/85">
              Owner view — includes staff pay, margins, risks, and what&apos;s blocked on you. Enter the PIN.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="PIN"
                className="w-full rounded-xl border border-[#f5c46b40] bg-[#120904]/75 px-4 py-3 text-base text-[#fff3d6] outline-none placeholder:text-[#f4deba]/35 focus:border-[#f5c46b] focus:ring-2 focus:ring-[#f5c46b33]"
              />
              {error ? <p className="text-sm text-[#f7b0a4]">{error}</p> : null}
              <button
                type="submit"
                className="rounded-full border border-[#f5c46b66] bg-[#d99028] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#2a1208] transition hover:bg-[#f5c46b]"
              >
                Open board
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={SHELL}>
      <MarketBoard internal />
    </main>
  );
}
