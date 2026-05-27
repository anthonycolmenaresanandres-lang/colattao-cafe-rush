import type { MenuCategory as MenuCategoryType } from "@/data/colattaoMenu";

export default function MenuCategory({ category }: { category: MenuCategoryType }) {
  return (
    <section id={category.id} className="scroll-mt-28">
      {/* ── category heading ── */}
      <h2 className="mb-1 border-b border-amber-800/30 pb-1 text-lg font-bold tracking-wide text-amber-900">
        {category.title}
      </h2>

      {category.note && (
        <p className="mb-2 text-xs italic text-amber-700/80">{category.note}</p>
      )}

      {/* ── item list ── */}
      <ul className="space-y-2">
        {category.items.map((item) => (
          <li key={item.name} className="flex items-baseline justify-between gap-2">
            <div className="min-w-0">
              <span className="font-medium text-amber-950">{item.name}</span>
              {item.description && (
                <p className="mt-0.5 text-xs leading-tight text-amber-700/70">
                  {item.description}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold text-amber-800">
              {item.price ?? "—"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
