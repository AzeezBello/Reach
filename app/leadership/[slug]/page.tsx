import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Photo } from "@/components/media";
import { Badge, ButtonLink, Container, Eyebrow } from "@/components/ui";
import { formatDate, humanize, initials } from "@/lib/format";
import { getLeader, getLeaderContent, getLeaders } from "@/lib/leaders";
import { pageArt } from "@/lib/media";
import { personSchema } from "@/lib/seo";
import type { CollaborationRole } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const leaders = await getLeaders();
  return leaders.map((leader) => ({ slug: leader.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const leader = await getLeader(slug);

  if (!leader) return { title: "Profile not found" };

  return {
    title: `${leader.name}, ${leader.role}`,
    description:
      leader.summary ?? `${leader.name}, ${leader.role}${leader.office ? `, ${leader.office}` : ""}.`,
    alternates: { canonical: `/leadership/${leader.slug}` },
    openGraph: leader.image_url
      ? { images: [{ url: leader.image_url, alt: leader.name }] }
      : undefined,
  };
}

export default async function LeadershipProfilePage({ params }: Params) {
  const { slug } = await params;
  const leader = await getLeader(slug);

  if (!leader) {
    notFound();
  }

  const content = await getLeaderContent(leader.id);

  const involvement = [
    {
      key: "programmes",
      title: "Programmes",
      icon: <ClipboardList size={18} />,
      items: content.programmes.map((item) => ({
        href: `/programmes/${item.slug}`,
        title: item.title,
        meta: item.category || "Programme",
        collaboration: item.collaboration,
      })),
    },
    {
      key: "projects",
      title: "Community projects",
      icon: <FolderKanban size={18} />,
      items: content.projects.map((item) => ({
        href: `/projects/${item.slug}`,
        title: item.title,
        meta: humanize(item.status, "Project"),
        collaboration: item.collaboration,
      })),
    },
    {
      key: "opportunities",
      title: "Opportunities",
      icon: <Sparkles size={18} />,
      items: content.opportunities.map((item) => ({
        href: `/opportunities/${item.slug}`,
        title: item.title,
        meta: humanize(item.type, "Opportunity"),
        collaboration: item.collaboration,
      })),
    },
    {
      key: "events",
      title: "Events",
      icon: <CalendarDays size={18} />,
      items: content.events.map((item) => ({
        href: `/events/${item.slug}`,
        title: item.title,
        meta: formatDate(item.starts_at) ?? "Event",
        collaboration: item.collaboration,
      })),
    },
  ].filter((group) => group.items.length > 0);

  const totalItems = involvement.reduce((sum, group) => sum + group.items.length, 0);

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
            <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-linear-to-br from-brand-400 to-brand-700 text-3xl font-extrabold text-ink sm:size-28">
              {leader.image_url ? (
                <Photo src={leader.image_url} alt={leader.name} sizes="112px" priority className="object-top" />
              ) : (
                initials(leader.name)
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow tone="light">{leader.role}</Eyebrow>
                {leader.level_label && <Badge tone="gold">{leader.level_label}</Badge>}
              </div>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
                {leader.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                {leader.office && (
                  <span className="inline-flex items-center gap-2">
                    <Building2 size={16} className="text-brand-400" />
                    {leader.office}
                  </span>
                )}
                {leader.jurisdiction && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} className="text-brand-400" />
                    {leader.jurisdiction}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-8 py-12 md:py-16 lg:grid-cols-[1fr_320px] lg:gap-12">
        <article className="space-y-6">
          {leader.biography.length > 0 && (
            <ProfileSection title="Profile">
              <div className="space-y-4 text-[15px] leading-7 text-slate-600">
                {leader.biography.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </ProfileSection>
          )}

          {leader.service.length > 0 && (
            <ProfileSection title="Public service">
              <ul className="space-y-3 text-[15px] leading-7 text-slate-600">
                {leader.service.map((item) => (
                  <li key={item} className="border-l-2 border-brand-300 pl-4">
                    {item}
                  </li>
                ))}
              </ul>
            </ProfileSection>
          )}

          {involvement.length > 0 && (
            <ProfileSection
              title="Programmes, projects & events"
              intro={`${totalItems} initiative${totalItems === 1 ? "" : "s"} led individually or delivered as a joint collaboration.`}
            >
              <div className="space-y-6">
                {involvement.map((group) => (
                  <div key={group.key}>
                    <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      <span className="text-brand-700">{group.icon}</span>
                      {group.title}
                    </h3>

                    <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="group flex items-center gap-3 p-4 transition hover:bg-brand-50/60"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-bold text-ink group-hover:text-brand-800">
                                {item.title}
                              </span>
                              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <CollaborationBadge role={item.collaboration} />
                                {item.meta}
                              </span>
                            </span>
                            <ArrowRight
                              size={16}
                              className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ProfileSection>
          )}

          {leader.sources.length > 0 && (
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
          )}
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

function CollaborationBadge({ role }: { role: CollaborationRole }) {
  return (
    <Badge tone={role === "lead" ? "brand" : "gold"}>
      {role === "lead" ? "Leads" : "Joint collaboration"}
    </Badge>
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
