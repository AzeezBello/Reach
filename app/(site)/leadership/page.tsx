import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ChevronDown, Crown, MapPin } from "lucide-react";

import { Photo } from "@/components/media";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui";
import { initials } from "@/lib/format";
import { getLeaders } from "@/lib/leaders";
import { groupLeaders, topOf, type LeadershipTier } from "@/lib/leadership";
import { pageArt } from "@/lib/media";
import type { Leader } from "@/lib/types";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "The chain of public leadership serving this community, from the Presidency and Lagos State Government down to local government, with official reference sources and each leader's initiatives.",
  alternates: { canonical: "/leadership" },
};

function LeaderCard({ leader, top = false }: { leader: Leader; top?: boolean }) {
  return (
    <article
      className={`group relative flex min-w-0 gap-5 rounded-3xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10 sm:p-6 ${
        top ? "border-brand-200 ring-1 ring-brand-100" : "border-slate-200"
      }`}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-brand-500 to-brand-800 font-extrabold text-white ${
          top ? "size-20 text-xl" : "size-16 text-lg"
        }`}
      >
        {leader.image_url ? (
          <Photo src={leader.image_url} alt={leader.name} sizes={top ? "80px" : "64px"} className="object-top" />
        ) : (
          initials(leader.name)
        )}
      </div>

      <div className="min-w-0 flex-1">
        {leader.office && (
          <p className="flex max-w-full items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
            <Building2 size={14} className="shrink-0" />
            <span className="min-w-0 truncate">{leader.office}</span>
          </p>
        )}

        <h3 className={`mt-1.5 font-extrabold text-ink ${top ? "text-2xl" : "text-xl"}`}>
          <Link
            href={`/leadership/${leader.slug}`}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand-800"
          >
            {leader.name}
          </Link>
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">{leader.role}</p>

        {leader.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{leader.summary}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {(leader.constituency || leader.jurisdiction) && (
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <MapPin size={14} className="text-brand-700" />
              {leader.constituency || leader.jurisdiction}
            </span>
          )}
          <span className="inline-flex items-center gap-2 font-bold text-brand-700">
            View profile
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

/** One rung of the hierarchy: a labelled tier with its office holders. */
function TierBlock({ tier, index, last }: { tier: LeadershipTier; index: number; last: boolean }) {
  const top = index === 0;
  const single = tier.members.length === 1;

  return (
    <li className="relative">
      <div className="flex items-start gap-4 sm:gap-6">
        {/* Rail */}
        <div className="flex w-10 shrink-0 flex-col items-center sm:w-12">
          <span
            className={`flex size-10 items-center justify-center rounded-full text-sm font-extrabold ring-4 ring-white sm:size-12 ${
              top ? "bg-brand-600 text-white shadow-lg shadow-brand-900/20" : "bg-brand-50 text-brand-800"
            }`}
          >
            {top ? <Crown size={18} /> : index + 1}
          </span>
          {!last && <span className="mt-1 w-0.5 flex-1 self-stretch bg-brand-100" aria-hidden="true" />}
        </div>

        <div className={`min-w-0 flex-1 ${last ? "" : "pb-10"}`}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-extrabold text-ink sm:text-xl">{tier.title}</h3>
            {tier.caption && <p className="text-sm text-slate-500">{tier.caption}</p>}
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              {tier.members.length} {tier.members.length === 1 ? "office holder" : "office holders"}
            </span>
          </div>

          <div className={`mt-4 grid gap-4 ${single ? "max-w-3xl" : "md:grid-cols-2"}`}>
            {tier.members.map((leader) => (
              <LeaderCard key={leader.slug} leader={leader} top={top} />
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export default async function LeadershipPage() {
  const leaders = await getLeaders();
  const groups = groupLeaders(leaders);

  return (
    <>
      <PageHero
        eyebrow="Public leadership"
        title="The chain of leadership"
        text="From the Presidency and Lagos State Government down to local councils: who holds office, who they answer to, and the programmes, projects and events each is involved in."
        image={pageArt.leadership}
        breadcrumbs={[{ label: "Leadership", href: "/leadership" }]}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
          <span className="size-2 rounded-full bg-gold-400" />
          {leaders.length} profiles across {groups.length} levels of government
        </p>
      </PageHero>

      {/* Chain overview */}
      <section className="border-b border-slate-100 bg-slate-50">
        <Container className="py-10 md:py-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">How it fits together</p>
          <ol className="mt-5 grid gap-3 md:grid-cols-3 md:gap-0">
            {groups.map((group, index) => {
              const head = topOf(group);

              return (
                <li key={group.id} className="relative min-w-0 md:px-3 md:first:pl-0 md:last:pr-0">
                  <a
                    href={`#${group.id}`}
                    className="group flex h-full min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink text-sm font-extrabold text-white">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-ink group-hover:text-brand-800">
                        {group.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {head ? `${head.role.split(";")[0]} · ${head.name}` : `${group.members.length} office holders`}
                      </span>
                    </span>
                    <ChevronDown size={16} className="ml-auto shrink-0 text-brand-700 md:hidden" />
                  </a>
                  {index < groups.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-full hidden h-3 w-0.5 -translate-x-1/2 bg-brand-200 md:left-auto md:right-0 md:top-1/2 md:block md:h-0.5 md:w-6 md:translate-x-1/2 md:-translate-y-1/2"
                    />
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Federal and state office holders set policy and budgets; local councils deliver services on the ground.
            Each profile links to official sources and the initiatives the leader is credited on.
          </p>
        </Container>
      </section>

      <Container className="space-y-16 py-12 md:py-16">
        {groups.map((group, groupIndex) => (
          <section key={group.id} id={group.id} aria-labelledby={`level-${group.id}`} className="scroll-mt-24">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
                  Level {groupIndex + 1} of {groups.length}
                </p>
                <h2 id={`level-${group.id}`} className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {group.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{group.description}</p>
              </div>
              <p className="text-sm font-bold text-slate-500">
                {group.tiers.length} {group.tiers.length === 1 ? "tier" : "tiers"} · {group.members.length} office holders
              </p>
            </div>

            <ol className="mt-8">
              {group.tiers.map((tier, index) => (
                <TierBlock key={tier.id} tier={tier} index={index} last={index === group.tiers.length - 1} />
              ))}
            </ol>
          </section>
        ))}
      </Container>
    </>
  );
}
