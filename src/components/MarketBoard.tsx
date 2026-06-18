import { MARKET } from "@/data/communityMarket";

/**
 * Project board for the Colattao Community Market, rendered like a lightweight
 * project-management app. `internal` unlocks the full owner view (money detail,
 * staff pay, risks, blocked-on-owner). Pure presentational — safe in server or
 * client trees (no hooks).
 */

const card = "rounded-2xl border border-[#f5c46b33] bg-[#1b0e08]/70 p-5";
const label = "text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5c46b]";
const muted = "text-[#f4deba]/80";

function Metric({ label: l, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#f5c46b22] bg-[#120904]/60 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-[#92aecd]">{l}</div>
      <div className="mt-1 font-serif text-2xl text-[#fff3d6]">{value}</div>
    </div>
  );
}

export default function MarketBoard({ internal = false }: { internal?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <header className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={label}>Project board{internal ? " · internal" : ""}</p>
            <h1 className="mt-2 font-serif text-3xl text-[#fff3d6] sm:text-4xl">{MARKET.name}</h1>
            <p className={`mt-1 text-sm ${muted}`}>{MARKET.tagline}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full border border-[#f5c46b55] bg-[#d99028]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#f5c46b]">
              {MARKET.status}
            </span>
            <span className="text-[11px] text-[#f4deba]/55">{MARKET.updated}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {MARKET.facts.map((f) => (
            <span key={f} className="rounded-lg border border-[#f5c46b22] bg-[#120904]/60 px-3 py-1.5 text-xs text-[#f4deba]/85">
              {f}
            </span>
          ))}
        </div>
      </header>

      {/* About + the one rule */}
      <section className={card}>
        <p className={`text-sm leading-relaxed ${muted}`}>{MARKET.about}</p>
        <div className="mt-4 rounded-xl border-l-2 border-[#d99028] bg-[#d99028]/10 px-4 py-3">
          <span className={label}>The one rule</span>
          <p className="mt-1 text-sm text-[#fff3d6]">{MARKET.theOneRule}</p>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Stage" value="1 of 7" />
        {internal ? (
          <>
            <Metric label="Net / market" value="$265" />
            <Metric label="Launch budget" value="$250–700" />
            <Metric label="Run by" value="Hired lead" />
          </>
        ) : (
          <>
            <Metric label="Cadence" value="Monthly" />
            <Metric label="Vendors" value="8–12" />
            <Metric label="Run by" value="Hired lead" />
          </>
        )}
      </div>

      {/* Approval pipeline */}
      <section className={card}>
        <h2 className={label}>Approval pipeline</h2>
        <ol className="mt-3 space-y-2">
          {MARKET.stages.map((s) => {
            const isNext = s.status === "next";
            const isDone = s.status === "done";
            return (
              <li
                key={s.n}
                className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${
                  isNext ? "border-[#f5c46b66] bg-[#d99028]/10" : "border-[#f5c46b1a] bg-[#120904]/40"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? "bg-[#8fcf88]/20 text-[#8fcf88]"
                      : isNext
                        ? "bg-[#d99028] text-[#2a1208]"
                        : "bg-[#f5c46b1a] text-[#f4deba]/60"
                  }`}
                >
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm ${isNext ? "text-[#fff3d6]" : "text-[#f4deba]/85"}`}>{s.name}</span>
                    <span
                      className={`text-[10px] uppercase tracking-[0.16em] ${
                        isNext ? "text-[#f5c46b]" : "text-[#f4deba]/45"
                      }`}
                    >
                      {isNext ? "Next" : isDone ? "Done" : "To do"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#f4deba]/60">{s.note}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Winning / losing */}
      <div className="grid gap-3 sm:grid-cols-2">
        <section className={card}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8fcf88]">What makes it win</h2>
          <ul className="mt-3 space-y-2">
            {MARKET.winning.map((w) => (
              <li key={w} className="flex gap-2 text-sm text-[#f4deba]/85">
                <span className="text-[#8fcf88]">+</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className={card}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e0795f]">What kills it</h2>
          <ul className="mt-3 space-y-2">
            {MARKET.losing.map((l) => (
              <li key={l} className="flex gap-2 text-sm text-[#f4deba]/85">
                <span className="text-[#e0795f]">×</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Money */}
      <section className={card}>
        <h2 className={label}>Money</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MARKET.booth.map((b) => (
            <span key={b.label} className="rounded-lg border border-[#f5c46b22] bg-[#120904]/60 px-3 py-1.5 text-xs text-[#f4deba]/85">
              {b.label} <span className="font-bold text-[#f5c46b]">{b.price}</span>
            </span>
          ))}
        </div>
        {internal ? (
          <>
            <div className="mt-4 overflow-hidden rounded-xl border border-[#f5c46b1a]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#120904]/60 text-[11px] uppercase tracking-[0.14em] text-[#92aecd]">
                    <th className="px-3 py-2 font-medium">Scenario</th>
                    <th className="px-3 py-2 text-right font-medium">Gross</th>
                    <th className="px-3 py-2 text-right font-medium">Costs</th>
                    <th className="px-3 py-2 text-right font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {MARKET.scenarios.map((s) => (
                    <tr key={s.size} className="border-t border-[#f5c46b14] text-[#f4deba]/85">
                      <td className="px-3 py-2">{s.size}</td>
                      <td className="px-3 py-2 text-right">${s.gross.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${s.expenses.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-bold text-[#8fcf88]">${s.net.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`mt-3 text-sm leading-relaxed ${muted}`}>{MARKET.moneyInternal}</p>
            <p className="mt-2 text-sm text-[#f5c46b]">{MARKET.launchBudget}</p>
          </>
        ) : (
          <p className={`mt-3 text-sm leading-relaxed ${muted}`}>{MARKET.moneyPublic}</p>
        )}
      </section>

      {/* Per-market income & expense ledger (public log) */}
      <section className={card}>
        <h2 className={label}>Market ledger · income &amp; expenses</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#f4deba]/60">
          Every market&apos;s income and expenses are logged here. Figures below are projected for the first market; actual numbers replace them after each event.
        </p>
        <div className="mt-4 space-y-3">
          {MARKET.ledger.map((m) => {
            const inc = m.income.reduce((a, b) => a + b.amount, 0);
            const exp = m.expenses.reduce((a, b) => a + b.amount, 0);
            const net = inc - exp;
            return (
              <div key={m.id} className="rounded-xl border border-[#f5c46b1a] bg-[#120904]/40 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium text-[#fff3d6]">{m.id}</span>
                  <span className="flex-1 text-xs text-[#f4deba]/60">{m.date}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      m.status === "held" ? "bg-[#8fcf88]/20 text-[#8fcf88]" : "bg-[#d99028]/20 text-[#f5c46b]"
                    }`}
                  >
                    {m.status === "held" ? "Held" : "Planned"}
                  </span>
                </div>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8fcf88]">Income</div>
                    <div className="mt-1.5 space-y-1">
                      {m.income.map((l) => (
                        <div key={l.label} className="flex justify-between gap-3 text-sm text-[#f4deba]/80">
                          <span>{l.label}</span>
                          <span>${l.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between gap-3 border-t border-[#f5c46b14] pt-1 text-sm font-medium text-[#fff3d6]">
                        <span>Total income</span>
                        <span>${inc.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#e0795f]">Expenses</div>
                    <div className="mt-1.5 space-y-1">
                      {m.expenses.map((l) => (
                        <div key={l.label} className="flex justify-between gap-3 text-sm text-[#f4deba]/80">
                          <span>{l.label}</span>
                          <span>${l.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between gap-3 border-t border-[#f5c46b14] pt-1 text-sm font-medium text-[#fff3d6]">
                        <span>Total expenses</span>
                        <span>${exp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between border-t border-[#f5c46b22] pt-2 text-sm">
                  <span className="font-bold uppercase tracking-[0.14em] text-[#f5c46b]">Net</span>
                  <span className="font-bold text-[#8fcf88]">${net.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roles */}
      <section className={card}>
        <h2 className={label}>Who runs it</h2>
        <div className="mt-3 space-y-2">
          {MARKET.roles.map((r) => (
            <div key={r.who} className="rounded-xl border border-[#f5c46b1a] bg-[#120904]/40 px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-[#fff3d6]">{r.who}</span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-[#92aecd]">{r.cadence}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-[#f4deba]/70">{r.owns}</p>
              {internal && r.pay ? <p className="mt-1 text-xs font-bold text-[#f5c46b]">{r.pay}</p> : null}
            </div>
          ))}
        </div>
      </section>

      {/* Internal: risks + blocked-on-owner */}
      {internal ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <section className={card}>
            <h2 className={label}>Top risks</h2>
            <ul className="mt-3 space-y-2.5">
              {MARKET.risks.map((r) => (
                <li key={r.risk} className="text-sm">
                  <span className="text-[#fff3d6]">{r.risk}</span>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#f4deba]/65">→ {r.mitigation}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className={card}>
            <h2 className={label}>Blocked on you</h2>
            <ul className="mt-3 space-y-2">
              {MARKET.blockedOnOwner.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-[#f4deba]/85">
                  <span className="text-[#d99028]">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {/* Docs */}
      <section className={card}>
        <h2 className={label}>Full package · {MARKET.docs.length} documents</h2>
        <div className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {MARKET.docs.map((d) => (
            <div key={d} className="text-sm text-[#f4deba]/75">{d}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
