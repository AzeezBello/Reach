import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";

import { Photo } from "@/components/media";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui";
import { initials } from "@/lib/format";
import { getLeaders } from "@/lib/leaders";
import { groupLeaders } from "@/lib/leadership";
import { pageArt } from "@/lib/media";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "Public leadership profiles, offices and official reference sources connected to this community.",
  alternates: { canonical: "/leadership" },
};

export default async function LeadershipPage() {
  const leaders = await getLeaders();
  const groups = groupLeaders(leaders);

  return (
    <>
      <PageHero
        eyebrow="Public leadership"
        title="Leadership profiles"
        text="Federal, Lagos State and local government office holders connected to this community, with official reference sources and the programmes, projects and events each leader is involved in."
        image={pageArt.leadership}
        breadcrumbs={[{ label: "Leadership", href: "/leadership" }]}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
          <span className="size-2 rounded-full bg-gold-400" />
          {leaders.length} profiles across {groups.length} levels of government
        </p>
      </PageHero>

      <Container className="space-y-14 py-12 md:py-16">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`level-${group.id}`}>
            <div className="max-w-2xl">
              <h2
                id={`level-${group.id}`}
                className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl"
              >
                {group.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                {group.description}
              </p>
            </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {group.members.map((leader) => (
            <article
              key={leader.slug}
              className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10 sm:p-7"
            >
              <div className="flex items-start gap-5">
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-brand-500 to-brand-800 text-lg font-extrabold text-white">
                  {leader.image_url ? (
                    <Photo src={leader.image_url} alt={leader.name} sizes="64px" className="object-top" />
                  ) : (
                    initials(leader.name)
                  )}
                </div>

                <div className="min-w-0">
                  {leader.office && (
                    <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
                      <Building2 size={14} />
                      {leader.office}
                    </p>
                  )}

                  <h3 className="mt-2 text-xl font-extrabold text-ink">
                    <Link
                      href={`/leadership/${leader.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand-800"
                    >
                      {leader.name}
                    </Link>
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {leader.role}
                  </p>

                  {leader.summary && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {leader.summary}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    {leader.jurisdiction && (
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <MapPin size={14} className="text-brand-700" />
                        {leader.jurisdiction}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-2 font-bold text-brand-700">
                      View profile
                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
          </section>
        ))}
      </Container>
    </>
  );
}
