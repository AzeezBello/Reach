import Link from "next/link";
import { Users } from "lucide-react";

import { Photo } from "@/components/media";
import { initials } from "@/lib/format";
import type { LeaderCredit } from "@/lib/types";

/**
 * "Led by" credits for a programme, opportunity, project or event.
 * One credit is an individual initiative; several make a joint collaboration.
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
        {credits.map(({ leader, role }) => (
          <li key={leader.slug}>
            <Link
              href={`/leadership/${leader.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/60"
            >
              <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-brand-500 to-brand-800 text-sm font-extrabold text-white">
                {leader.image_url ? (
                  <Photo src={leader.image_url} alt={leader.name} sizes="44px" />
                ) : (
                  initials(leader.name)
                )}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold text-ink group-hover:text-brand-800">
                  {leader.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {role === "lead" ? "Lead" : "Collaboration partner"} · {leader.role}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
