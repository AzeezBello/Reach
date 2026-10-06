import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import { Photo } from "@/components/media";
import { initials } from "@/lib/format";
import type { LeaderCredit } from "@/lib/types";

function Avatar({
  credit,
  size,
}: {
  credit: LeaderCredit;
  size: "sm" | "md" | "lg";
}) {
  const classes =
    size === "lg"
      ? "size-16 rounded-2xl text-lg"
      : size === "md"
        ? "size-11 rounded-xl text-sm"
        : "size-8 rounded-lg text-[11px]";

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-linear-to-br from-brand-500 to-brand-800 font-extrabold text-white ring-2 ring-white ${classes}`}
    >
      {credit.leader.image_url ? (
        <Photo
          src={credit.leader.image_url}
          alt={credit.leader.name}
          sizes={size === "lg" ? "64px" : size === "md" ? "44px" : "32px"}
          className="object-top"
        />
      ) : (
        initials(credit.leader.name)
      )}
    </span>
  );
}

function creditLabel(credits: LeaderCredit[]) {
  const names = credits.map((credit) => credit.leader.name);

  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}

/**
 * Compact credit line for listing cards: stacked avatars plus names.
 * Links sit above the card's stretched link so each opens the profile.
 */
export function LeaderAvatars({ credits }: { credits: LeaderCredit[] }) {
  if (credits.length === 0) return null;

  const joint = credits.length > 1;

  return (
    <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
      <div className="flex -space-x-2">
        {credits.slice(0, 3).map((credit) => (
          <Link
            key={credit.leader.slug}
            href={`/leadership/${credit.leader.slug}`}
            title={`${credit.leader.name} · ${credit.leader.role}`}
            className="relative z-10 rounded-lg transition hover:-translate-y-0.5"
          >
            <Avatar credit={credit} size="sm" />
          </Link>
        ))}
      </div>

      <p className="min-w-0 text-xs leading-5 text-slate-500">
        <span className="block font-extrabold uppercase tracking-wider text-[10px] text-brand-700">
          {joint ? "Joint collaboration" : "Led by"}
        </span>
        <Link
          href={`/leadership/${credits[0]!.leader.slug}`}
          className="relative z-10 block truncate font-bold text-ink hover:text-brand-800"
        >
          {creditLabel(credits)}
        </Link>
      </p>
    </div>
  );
}

/**
 * Prominent "Leaders involved" section on a detail page. Every leader links
 * to their public profile, where the rest of their initiatives are listed.
 */
export function LeadersInvolved({
  credits,
  itemLabel = "initiative",
}: {
  credits: LeaderCredit[];
  itemLabel?: string;
}) {
  if (credits.length === 0) return null;

  const joint = credits.length > 1;

  return (
    <section aria-labelledby="leaders-involved" className="mt-12 border-t border-slate-100 pt-10">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
        <Users size={14} />
        {joint ? "Joint collaboration" : "Individual initiative"}
      </p>

      <h2 id="leaders-involved" className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {joint ? "Leaders involved" : "Led by"}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {joint
          ? `This ${itemLabel} is delivered jointly by the leaders below. Open a profile to see their office, record of service and other initiatives.`
          : `This ${itemLabel} is led by the office below. Open the profile to see their record of service and other initiatives.`}
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {credits.map((credit) => (
          <li key={credit.leader.slug}>
            <Link
              href={`/leadership/${credit.leader.slug}`}
              className="group flex h-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/10 sm:p-5"
            >
              <Avatar credit={credit} size="lg" />

              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
                  {credit.role === "lead" ? "Lead" : "Collaboration partner"}
                </span>
                <span className="mt-1 block truncate text-lg font-extrabold text-ink group-hover:text-brand-800">
                  {credit.leader.name}
                </span>
                <span className="block truncate text-sm text-slate-500">{credit.leader.role}</span>
                {credit.leader.office && (
                  <span className="mt-0.5 block truncate text-xs text-slate-400">{credit.leader.office}</span>
                )}
              </span>

              <ArrowRight size={18} className="shrink-0 text-brand-700 transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Compact credits for a sidebar. Kept for the leader workspace and any
 * place where the full section is too large.
 */
export function LeadersPanel({ credits }: { credits: LeaderCredit[] }) {
  if (credits.length === 0) return null;

  const joint = credits.length > 1;

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
        <Users size={14} className="text-brand-700" />
        {joint ? "Joint collaboration" : "Led by"}
      </p>

      <ul className="mt-4 space-y-3">
        {credits.map((credit) => (
          <li key={credit.leader.slug}>
            <Link
              href={`/leadership/${credit.leader.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/60"
            >
              <Avatar credit={credit} size="md" />

              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold text-ink group-hover:text-brand-800">
                  {credit.leader.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {credit.role === "lead" ? "Lead" : "Collaboration partner"} · {credit.leader.role}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
