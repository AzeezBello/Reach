import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Photo } from "@/components/media";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { initials } from "@/lib/format";
import { getLeader, leaders } from "@/lib/leadership";
import { pageArt } from "@/lib/media";
import { personSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return leaders.map((leader) => ({ slug: leader.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const leader = getLeader(slug);

  if (!leader) return { title: "Profile not found" };

  return {
    title: `${leader.name}, ${leader.role}`,
    description: leader.summary,
    alternates: { canonical: `/leadership/${leader.slug}` },
  };
}

export default async function LeadershipProfilePage({ params }: Params) {
  const { slug } = await params;
  const leader = getLeader(slug);

  if (!leader) {
    notFound();
  }

  return (
    <>
      <JsonLd data={personSchema(leader)} />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Photo
          src={pageArt.leadership.src}
          alt=""
          priority
          sizes="100vw"
          className="-z-20 opacity-20"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/90 to-ink/60" />

        <Container className="py-12 md:py-16">
          <Breadcrumbs
            tone="light"
            items={[
              { label: "Leadership", href: "/leadership" },
              { label: leader.name, href: `/leadership/${leader.slug}` },
            ]}
          />

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-linear-to-br from-brand-400 to-brand-700 text-3xl font-extrabold text-ink sm:size-28">
              {initials(leader.name)}
            </div>

            <div>
              <Eyebrow tone="light">{leader.role}</Eyebrow>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
                {leader.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Building2 size={16} className="text-brand-400" />
                  {leader.office}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-brand-400" />
                  {leader.jurisdiction}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px] lg:gap-12 md:py-16">
        <article className="space-y-6">
          <ProfileSection title="Profile">
            <div className="space-y-4 text-[15px] leading-7 text-slate-600">
              {leader.biography.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection title="Public service">
            <ul className="space-y-3 text-[15px] leading-7 text-slate-600">
              {leader.service.map((item) => (
                <li key={item} className="border-l-2 border-brand-300 pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </ProfileSection>

          <ProfileSection
            title="Official reference sources"
            intro="These profiles use official public sources as references. External sources open in a new tab."
          >
            <div className="space-y-3">
              {leader.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-800"
                >
                  {source.label}
                  <ArrowUpRight size={16} className="shrink-0" />
                </a>
              ))}
            </div>
          </ProfileSection>
        </article>

        <aside className="h-fit rounded-3xl bg-brand-700 p-7 text-white shadow-sm lg:sticky lg:top-24">
          <Eyebrow tone="light">Need help?</Eyebrow>

          <h2 className="mt-3 text-2xl font-extrabold text-balance">
            Need help with a public service?
          </h2>

          <p className="mt-3 text-sm leading-6 text-brand-100">
            Submit a request and the office can help route it to the
            appropriate service.
          </p>

          <ButtonLink href="/requests/new" variant="light" className="mt-6 w-full">
            Submit a request
          </ButtonLink>
        </aside>
      </Container>
    </>
  );
}

function ProfileSection({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>

      {intro && (
        <p className="mt-2 text-sm leading-6 text-slate-500">{intro}</p>
      )}

      <div className="mt-4">{children}</div>
    </section>
  );
}
