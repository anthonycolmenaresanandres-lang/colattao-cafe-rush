import type { MenuCategory as MenuCategoryType } from "@/data/colattaoMenu";

export default function MenuCategory({ category }: { category: MenuCategoryType }) {
  return (
    <section id={category.id} className="menu-card scroll-mt-32 px-5 pb-5 pt-5">
      {/* ── Category header ── */}
      <div className="text-center">
        <p
          className="text-[10px] uppercase text-[var(--col-gold-deep)]"
          style={{ letterSpacing: "0.32em" }}
        >
          La Carta
        </p>
        <h2
          className="brand-wordmark mt-1 text-[22px] text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.04em" }}
        >
          {category.title}
        </h2>
        <div className="ceramic-rule mx-auto mt-2 w-2/3" />
        {category.note && (
          <p className="mt-2 text-[11px] italic text-[var(--col-espresso-3)]/75">
            {category.note}
          </p>
        )}
      </div>

      {/* ── Items ── */}
      <ul className="mt-4 space-y-3">
        {category.items.map((item) => (
          <li
            key={item.name}
            className="flex items-baseline gap-2 text-[var(--col-espresso)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline">
                <span className="font-semibold leading-tight">
                  {item.name}
                  {item.needsConfirmation && (
                    <span
                      aria-label="Needs confirmation"
                      title="Item details may vary — please ask staff"
                      className="ml-1.5 align-[0.05em] text-[9px] uppercase tracking-[0.18em] text-[var(--col-terracotta-2)]"
                    >
                      • verify
                    </span>
                  )}
                </span>
                <span className="dotted-rule" />
              </div>
              {item.description && (
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--col-espresso-3)]/75">
                  {item.description}
                </p>
              )}
            </div>
            <span className="shrink-0 font-mono text-sm font-bold tracking-tight text-[var(--col-gold-deep)]">
              {item.price ?? "ask"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
