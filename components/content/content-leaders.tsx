import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Photo } from "@/components/media";
import { initials } from "@/lib/format";
import type { ContentCredit } from "@/lib/types";

const SIZES = {
  sm: { box: "size-8 rounded-lg text-[11px]", px: "32px" },
  md: { box: "size-12 rounded-xl text-sm", px: "48px" },
  lg: { box: "size-16 rounded-2xl text-lg", px: "64px" },
};

export function LeaderPortrait({
  credit,
  size = "md",
}: {
  credit: ContentCredit;
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-linear-to-br from-brand-500 to-brand-800 font-extrabold text-white ring-2 ring-white ${SIZES[size].box}`}
    >
      {credit.leader.image_url ? (
        <Photo
          src={credit.leader.image_url}
          alt={credit.leader.name}
          sizes={SIZES[size].px}
          className="object-top"
        />
      ) : (
        initials(credit.leader.name)
      )}
    </span>
  );
}

export function roleLabel(role: ContentCredit["role"]) {
  return role === "lead" ? "Lead" : "Partner";
}

/**
 * Compact credit line for cards: stacked portraits plus "Lead: Name".
 * Links are raised above the card's stretched link so they open profiles.
 */
export function LeaderAvatars({ credits }: { credits: ContentCredit[] }) {
  if (credits.length === 0) return null;

  const lead = credits.find((credit) => credit.role === "lead") ?? credits[0]!;
  const partners = credits.filter((credit) => credit !== lead);

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {credits.slice(0, 3).map((credit) => (
          <Link
            key={credit.leader.slug}
            href={`/leadership/${credit.leader.slug}`}
            title={`${credit.leader.name} · ${roleLabel(credit.role)}`}
            className="relative z-10 rounded-lg transition hover:-translate-y-0.5"
          >
            <LeaderPortrait credit={credit} size="sm" />
          </Link>
        ))}
      </div>

      <p className="min-w-0 text-xs leading-5">
        <Link
          href={`/leadership/${lead.leader.slug}`}
          className="relative z-10 block truncate font-bold text-ink hover:text-brand-800"
        >
          <span className="font-extrabold uppercase tracking-wider text-[10px] text-brand-700">
            {roleLabel(lead.role)}
          </span>{" "}
          {lead.leader.name}
        </Link>
        {partners.length > 0 && (
          <span className="block truncate text-slate-500">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">
              Partner
            </span>{" "}
            {partners.length === 1
              ? partners[0]!.leader.name
              : `${partners[0]!.leader.name} +${partners.length - 1}`}
          </span>
        )}
      </p>
    </div>
  );
}

/** Portrait rows for the accountability panel; each links to the profile. */
export function LeaderList({ credits }: { credits: ContentCredit[] }) {
  if (credits.length === 0) {
    return (
      <p className="text-sm leading-6 text-slate-500">
        No individual leader has been credited for this item.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {credits.map((credit) => (
        <li key={credit.leader.slug}>
          <Link
            href={`/leadership/${credit.leader.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-brand-300 hover:bg-brand-50/60"
          >
            <LeaderPortrait credit={credit} size="lg" />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-extrabold text-ink group-hover:text-brand-800">
                {credit.leader.name}
              </span>
              <span className="block truncate text-sm text-slate-600">{credit.leader.role}</span>
              <span className="mt-1 inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-800">
                {roleLabel(credit.role)}
              </span>
            </span>

            <ArrowRight
              size={18}
              className="shrink-0 text-brand-700 transition group-hover:translate-x-0.5"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
