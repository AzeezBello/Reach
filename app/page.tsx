import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { ContentCard } from "@/components/content-card";
import { Photo, PhotoFrame } from "@/components/media";
import {
  Badge,
  ButtonLink,
  Container,
  EmptyState,
  Eyebrow,
  SectionHeader,
  TextLink,
} from "@/components/ui";
import { VideoPlayer } from "@/components/video-player";
import { formatDate, humanize, initials, statusTone } from "@/lib/format";
import { leaders } from "@/lib/leadership";
import { gallery, hero, photos, stories } from "@/lib/media";
import { getPublicData, getTenant } from "@/lib/reach";
import { siteDescription, siteTitle } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { tenant, jurisdiction } = await getTenant();

  return {
    title: { absolute: siteTitle(tenant) },
    description: siteDescription(tenant, jurisdiction),
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const { tenant, jurisdiction, programmes, opportunities, projects } =
    await getPublicData();

  const quickLinks = [
    {
      href: "/programmes",
      icon: <ClipboardList size={22} />,
      title: "Programmes",
      text: `${programmes.length} open now`,
    },
    {
      href: "/opportunities",
      icon: <Sparkles size={22} />,
      title: "Opportunities",
      text: `${opportunities.length} available`,
    },
    {
      href: "/projects",
      icon: <FolderKanban size={22} />,
      title: "Projects",
      text: `${projects.length} being tracked`,
    },
    {
      href: "/requests/new",
      icon: <MessageCircle size={22} />,
      title: "Requests",
      text: "Report an issue or ask for help",
    },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                           */}
      {/* ------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Photo
          src={hero.background.src}
          alt=""
          priority
          sizes="100vw"
          className="-z-20 opacity-25"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/90 to-ink/50" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/20 to-transparent" />

        <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">
              <span className="size-2 rounded-full bg-gold-400" />
              {jurisdiction
                ? `${jurisdiction.name}${
                    jurisdiction.state ? ` · ${jurisdiction.state}` : ""
                  }`
                : "Digital constituency office"}
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Your community.
              <br />
              <span className="text-brand-400">One digital office.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              {tenant.description ||
                "Connect with public programmes, opportunities, service requests and community projects through one simple digital experience."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/requests/new" size="lg" arrow>
                Request assistance
              </ButtonLink>

              <ButtonLink href="/programmes" variant="outlineLight" size="lg">
                Explore programmes
              </ButtonLink>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-400" />
                Public service access
              </li>
              <li className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-400" />
                Secure resident accounts
              </li>
              <li className="inline-flex items-center gap-2">
                <Smartphone size={16} className="text-brand-400" />
                Works on any phone
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[320px]">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-brand-500/25 blur-3xl" />

            <VideoPlayer
              mode="ambient"
              src={hero.video}
              poster={hero.poster.src}
              title={`${tenant.name} community highlights`}
              className="aspect-[9/16] rounded-[2rem] shadow-2xl shadow-black/50 ring-1 ring-white/20"
            />

            <div className="absolute -left-4 bottom-8 hidden rounded-2xl bg-white p-4 text-ink shadow-xl sm:block lg:-left-10">
              <p className="text-2xl font-extrabold">{programmes.length}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Programmes open
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Quick links                                                    */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-white">
        <Container className="relative z-10 -mt-8">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                    {item.icon}
                  </span>

                  <span className="min-w-0">
                    <span className="block font-extrabold text-ink">
                      {item.title}
                    </span>
                    <span className="block truncate text-sm text-slate-500">
                      {item.text}
                    </span>
                  </span>

                  <ArrowRight
                    size={18}
                    className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* How it works + gallery                                         */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-white">
        <Container className="py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <Eyebrow>Built around residents</Eyebrow>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
                Find help. Take part. Stay informed.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {tenant.name} brings civic information and service pathways
                together, so residents spend less time working out where to
                go and more time getting things done.
              </p>

              <ol className="mt-8 space-y-5">
                {[
                  {
                    title: "Discover",
                    text: "Find programmes, opportunities and community initiatives near you.",
                  },
                  {
                    title: "Engage",
                    text: "Create an account, submit a request and connect with the right office.",
                  },
                  {
                    title: "Track",
                    text: "Follow your requests and public projects as they progress.",
                  },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
                      0{index + 1}
                    </span>

                    <div>
                      <h3 className="font-extrabold text-ink">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {gallery.map((photo, index) => (
                <PhotoFrame
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  aspect={index === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}
                  sizes={
                    index === 0
                      ? "(min-width: 1024px) 640px, 100vw"
                      : "(min-width: 1024px) 320px, 50vw"
                  }
                  className="rounded-3xl"
                >
                  <div className="absolute inset-0 bg-linear-to-t from-ink/30 to-transparent" />
                </PhotoFrame>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Programmes                                                     */}
      {/* ------------------------------------------------------------ */}
      <section className="border-y border-slate-100 bg-slate-50">
        <Container className="py-16 md:py-24">
          <SectionHeader
            eyebrow="Programmes"
            title="What is available right now?"
            text={`Programmes and initiatives currently published by ${tenant.name}.`}
            action={<TextLink href="/programmes">View all programmes</TextLink>}
          />

          {programmes.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {programmes.slice(0, 3).map((programme) => (
                <ContentCard
                  key={programme.id}
                  href={`/programmes/${programme.slug}`}
                  title={programme.title}
                  summary={programme.summary}
                  image={programme.image_url}
                  fallbackIcon={<ClipboardList size={28} />}
                  badges={[{ label: programme.category || "Programme" }]}
                  meta={[
                    programme.location && {
                      icon: <MapPin size={14} />,
                      text: programme.location,
                    },
                    programme.registration_deadline && {
                      icon: <CalendarDays size={14} />,
                      text: `Apply by ${formatDate(programme.registration_deadline)}`,
                    },
                  ].filter(Boolean) as { icon: React.ReactNode; text: string }[]}
                  cta="View programme"
                />
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                icon={<ClipboardList size={28} />}
                title="New programmes will appear here"
                text="There are no active programmes published for this office yet. Check back as new initiatives become available."
                action={<ButtonLink href="/programmes">Browse programmes</ButtonLink>}
              />
            </div>
          )}
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Opportunities + projects                                       */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-white">
        <Container className="grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-10">
          <CompactList
            eyebrow="Opportunities"
            title="Scholarships, training and support"
            href="/opportunities"
            linkLabel="All opportunities"
            emptyText="Opportunities will be listed here as they are published."
            items={opportunities.slice(0, 3).map((opportunity) => ({
              href: `/opportunities/${opportunity.slug}`,
              title: opportunity.title,
              badge: humanize(opportunity.type, "Opportunity"),
              tone: "brand" as const,
              meta: opportunity.deadline
                ? `Deadline ${formatDate(opportunity.deadline)}`
                : opportunity.location || "Open to residents",
              icon: <Sparkles size={20} />,
            }))}
          />

          <CompactList
            eyebrow="Community projects"
            title="Follow what is being delivered"
            href="/projects"
            linkLabel="All projects"
            emptyText="Community projects will be listed here as they are published."
            items={projects.slice(0, 3).map((project) => ({
              href: `/projects/${project.slug}`,
              title: project.title,
              badge: humanize(project.status, "Project"),
              tone: statusTone(project.status),
              meta: project.location || project.category || "Community project",
              icon: <FolderKanban size={20} />,
            }))}
          />
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Stories                                                        */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-ink">
        <Container className="py-16 md:py-24">
          <SectionHeader
            tone="light"
            eyebrow="From the community"
            title="See the office in action"
            text="Short videos from programmes and activities across the constituency. Tap a story to watch."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <figure key={story.src}>
                <VideoPlayer
                  src={story.src}
                  poster={story.poster}
                  title={story.title}
                  className="aspect-[4/5] rounded-3xl ring-1 ring-white/10"
                />

                <figcaption className="mt-4">
                  <p className="font-extrabold text-white">{story.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {story.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Leadership                                                     */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-white">
        <Container className="py-16 md:py-24">
          <SectionHeader
            eyebrow="Public leadership & offices"
            title="Connect with the wider civic network"
            text="Public profiles and official reference sources for the offices connected to this community."
            action={<TextLink href="/leadership">All profiles</TextLink>}
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.map((leader) => (
              <article
                key={leader.slug}
                className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-800 text-lg font-extrabold text-white">
                  {initials(leader.name)}
                </div>

                <h3 className="mt-5 text-lg font-extrabold leading-tight text-ink">
                  <Link
                    href={`/leadership/${leader.slug}`}
                    className="after:absolute after:inset-0 after:content-[''] group-hover:text-brand-800"
                  >
                    {leader.name}
                  </Link>
                </h3>

                <p className="mt-1 text-sm font-bold text-brand-700">
                  {leader.role}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {leader.office}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink">
                  View profile
                  <ArrowRight
                    size={15}
                    className="transition group-hover:translate-x-0.5"
                  />
                </span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Request CTA                                                    */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-white">
        <Container className="pb-16 md:pb-24">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-900 text-white">
            <Photo
              src={photos.officeMeeting.src}
              alt=""
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="-z-20 opacity-40"
            />
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950 via-brand-900/90 to-brand-800/60" />

            <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:p-16">
              <div>
                <Eyebrow tone="light">Need assistance?</Eyebrow>

                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
                  Tell the office what you need.
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-brand-100 sm:text-lg">
                  Submit a service request through {tenant.name}. You will get
                  a reference number so you can follow up on progress.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <ButtonLink href="/requests/new" variant="light" size="lg" arrow>
                  Start a request
                </ButtonLink>
                <ButtonLink href="/requests" variant="outlineLight" size="lg">
                  Track my requests
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Local pieces                                                        */
/* ------------------------------------------------------------------ */

type CompactItem = {
  href: string;
  title: string;
  badge: string;
  tone: "brand" | "gold" | "slate" | "ink";
  meta: string;
  icon: React.ReactNode;
};

function CompactList({
  eyebrow,
  title,
  href,
  linkLabel,
  emptyText,
  items,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
  emptyText: string;
  items: CompactItem[];
}) {
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>

      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>

      {items.length > 0 ? (
        <ul className="mt-6 divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white shadow-sm">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center gap-4 p-4 transition hover:bg-brand-50/60 sm:p-5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                  {item.icon}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold text-ink group-hover:text-brand-800">
                    {item.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Badge tone={item.tone}>{item.badge}</Badge>
                    <span>{item.meta}</span>
                  </span>
                </span>

                <ArrowRight
                  size={18}
                  className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          {emptyText}
        </p>
      )}

      <TextLink href={href} className="mt-5">
        {linkLabel}
      </TextLink>
    </div>
  );
}
