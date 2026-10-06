import type { ReactNode } from "react";

export type CardMeta = { icon: ReactNode; text: string };

/** Icon + text facts shown under a card summary (dates, location, capacity). */
export function ContentMeta({ items }: { items: CardMeta[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
      {items.map((item) => (
        <span
          key={item.text}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"
        >
          <span className="text-brand-700">{item.icon}</span>
          {item.text}
        </span>
      ))}
    </div>
  );
}
