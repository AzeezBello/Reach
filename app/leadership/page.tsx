import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";

import { Container } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { initials } from "@/lib/format";
import { leaders } from "@/lib/leadership";
import { pageArt } from "@/lib/media";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "Public leadership profiles, offices and official reference sources connected to this community.",
  alternates: { canonical: "/leadership" },
};

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Public leadership"
        title="Leadership profiles"
        text="Public-service profiles, offices, jurisdictions and official reference sources connected to this community."
        image={pageArt.leadership}
        breadcrumbs={[{ label: "Leadership", href: "/leadership" }]}
      />

      <Container className="py-12 md:py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {leaders.map((leader) => (
            <article
              key={leader.slug}
              className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10 sm:p-7"
            >
              <div className="flex items-start gap-5">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-800 text-lg font-extrabold text-white">
                  {initials(leader.name)}
                </div>

                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
                    <Building2 size={14} />
                    {leader.office}
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold text-ink">
                    <Link
                      href={`/leadership/${leader.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand-800"
                    >
                      {leader.name}
                    </Link>
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {leader.role}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {leader.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <MapPin size={14} className="text-brand-700" />
                      {leader.jurisdiction}
                    </span>

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
      </Container>
    </>
  );
}
