import { Building2, Landmark, MapPin, Users } from "lucide-react";

import { LeaderAvatars, LeaderList } from "@/components/content/content-leaders";
import { humanize } from "@/lib/format";
import type { ContentAttribution } from "@/lib/types";

type Props = Partial<ContentAttribution>;

function jurisdictionLabel(jurisdiction: ContentAttribution["jurisdiction"] | undefined) {
  if (!jurisdiction) return null;

  const type = jurisdiction.type ? humanize(jurisdiction.type) : null;

  if (!type || jurisdiction.name.toLowerCase().includes(type.toLowerCase())) {
    return jurisdiction.name;
  }

  return `${jurisdiction.name} · ${type}`;
}

/**
 * Compressed hierarchy for cards:
 *   Organization · Responsible office
 *   Lead: Name / Partner: Name
 */
export function AttributionRow({ organization, office, jurisdiction, leaders = [] }: Props) {
  const line = [organization?.name, office?.name].filter(Boolean).join(" · ");

  if (!line && leaders.length === 0) return null;

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      {line && (
        <p className="flex items-start gap-2 text-xs leading-5 text-slate-600">
          <Landmark size={14} className="mt-0.5 shrink-0 text-brand-700" />
          <span className="min-w-0">
            <span className="block font-bold text-ink">{organization?.name}</span>
            {office && <span className="block truncate">{office.name}</span>}
            {jurisdiction && !office && (
              <span className="block truncate">{jurisdictionLabel(jurisdiction)}</span>
            )}
          </span>
        </p>
      )}

      <LeaderAvatars credits={leaders} />
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-bold text-slate-800">{children}</div>
      </div>
    </div>
  );
}

/**
 * The "Who is responsible for this?" panel at the top of every detail page:
 * Organization → Jurisdiction → Responsible office → Leadership.
 * Leaders come only from explicit credits, never from rank.
 */
export function ContentAccountability({ organization, jurisdiction, office, leaders = [] }: Props) {
  if (!organization && !jurisdiction && !office && leaders.length === 0) return null;

  return (
    <section
      aria-labelledby="accountability"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
    >
      <p id="accountability" className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
        Accountability
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Who is responsible for this, from the organization down to the leaders credited for it.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
        <div className="space-y-5">
          <Row icon={<Landmark size={18} />} label="Organization">
            {organization?.name ?? "Not specified"}
          </Row>
          <Row icon={<MapPin size={18} />} label="Jurisdiction">
            {jurisdictionLabel(jurisdiction) ?? "Not specific to one area"}
          </Row>
          <Row icon={<Building2 size={18} />} label="Responsible office">
            {office ? (
              <>
                {office.name}
                {office.type && office.type !== "other" && (
                  <span className="block text-xs font-semibold text-slate-500">{humanize(office.type)}</span>
                )}
                {(office.contact_email || office.contact_phone) && (
                  <span className="mt-1 block space-x-3 text-xs font-semibold text-slate-500">
                    {office.contact_email && (
                      <a href={`mailto:${office.contact_email}`} className="hover:text-brand-800">
                        {office.contact_email}
                      </a>
                    )}
                    {office.contact_phone && (
                      <a href={`tel:${office.contact_phone}`} className="hover:text-brand-800">
                        {office.contact_phone}
                      </a>
                    )}
                  </span>
                )}
              </>
            ) : (
              "Not specified"
            )}
          </Row>
        </div>

        <div>
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <Users size={14} className="text-brand-700" />
            Leadership
            {leaders.length > 1 && (
              <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] text-gold-700">
                Joint collaboration
              </span>
            )}
          </p>
          <div className="mt-3">
            <LeaderList credits={leaders} />
          </div>
        </div>
      </div>
    </section>
  );
}
