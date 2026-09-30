import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui";
import { Photo } from "@/components/media";
import type { Tone } from "@/lib/format";

export type CardBadge = { label: string; tone?: Tone };
export type CardMeta = { icon: ReactNode; text: string };

/**
 * One card design shared by programmes, opportunities and projects.
 * The whole card is clickable through the stretched title link.
 */
export function ContentCard({
  href,
  title,
  summary,
  image,
  fallbackIcon,
  badges = [],
  meta = [],
  cta,
  priority = false,
}: {
  href: string;
  title: string;
  summary?: string | null;
  image?: string | null;
  fallbackIcon: ReactNode;
  badges?: CardBadge[];
  meta?: CardMeta[];
  cta: string;
  priority?: boolean;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {image ? (
          <Photo
            src={image}
            alt={title}
            priority={priority}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-brand-100 via-brand-50 to-gold-100">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-900/20">
              {fallbackIcon}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        <h3 className="mt-3 text-xl font-extrabold leading-tight text-ink">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand-800"
          >
            {title}
          </Link>
        </h3>

        {summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {summary}
          </p>
        )}

        {meta.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {meta.map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"
              >
                <span className="text-brand-700">{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>
        )}

        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-brand-700">
          {cta}
          <ArrowRight
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  );
}
