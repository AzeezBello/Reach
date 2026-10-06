import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  FolderKanban,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";

import { ContentCard } from "@/components/content/content-card";
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
import {
  formatDate,
  formatTime,
  humanize,
  initials,
  statusTone,
} from "@/lib/format";
import { getLeaders } from "@/lib/leaders";
import { gallery, hero, photos, stories } from "@/lib/media";
import {
  getPublicData,
  getTenant,
  splitEvents,
} from "@/lib/reach";
import { siteDescription, siteTitle } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { tenant, jurisdiction } = await getTenant();

  const title = siteTitle(tenant);
  const description = siteDescription(
    tenant,
    jurisdiction,
  );

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: "/",
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const [
    {
      tenant,
      jurisdiction,
      programmes,
      opportunities,
      projects,
      events,
    },
    leaders,
  ] = await Promise.all([
    getPublicData(),
    getLeaders(),
  ]);

  const { upcoming: upcomingEvents } = splitEvents(events);

  const publishedProgrammes = programmes.slice(0, 3);
  const publishedOpportunities =
    opportunities.slice(0, 3);
  const publishedProjects = projects.slice(0, 3);
  const publishedEvents = upcomingEvents.slice(0, 3);
  const featuredLeaders = leaders.slice(0, 4);

  const locationLabel = jurisdiction
    ? [
        jurisdiction.name,
        jurisdiction.state,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Digital public service office";

  const quickActions = [
    {
      href: "/requests/new",
      icon: <MessageCircle size={21} />,
      title: "Request assistance",
      description:
        "Report an issue or ask the office for help.",
      featured: true,
    },
    {
      href: "/programmes",
      icon: <ClipboardList size={21} />,
      title: "Programmes",
      description:
        `${programmes.length} currently published`,
    },
    {
      href: "/opportunities",
      icon: <Sparkles size={21} />,
      title: "Opportunities",
      description:
        `${opportunities.length} available`,
    },
    {
      href: "/projects",
      icon: <FolderKanban size={21} />,
      title: "Projects",
      description:
        `${projects.length} being tracked`,
    },
  ];

  return (
    <>
      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Photo
          src={hero.background.src}
          alt=""
          priority
          sizes="100vw"
          className="-z-30"
        />

        <div className="absolute inset-0 -z-20 bg-ink/75" />

        <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/85 to-ink/35" />

        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-ink/80 to-transparent" />

        <Container className="relative py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-slate-100 backdrop-blur">
                <span className="size-2 rounded-full bg-brand-400" />
                {locationLabel}
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Your community.
                <br />
                <span className="text-brand-400">
                  One digital office.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                {tenant.description ||
                  "Access public services, programmes, opportunities and community information through one simple digital experience."}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/requests/new"
                  size="lg"
                  arrow
                >
                  Request assistance
                </ButtonLink>

                <ButtonLink
                  href="/programmes"
                  variant="outlineLight"
                  size="lg"
                >
                  Explore programmes
                </ButtonLink>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-brand-400"
                  />
                  Public service access
                </span>

                <span className="inline-flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className="text-brand-400"
                  />
                  Secure accounts
                </span>

                <span className="inline-flex items-center gap-2">
                  <Smartphone
                    size={16}
                    className="text-brand-400"
                  />
                  Mobile friendly
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[300px]">
              <div className="absolute -inset-10 -z-10 rounded-full bg-brand-500/25 blur-3xl" />

              <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
                <VideoPlayer
                  mode="ambient"
                  src={hero.video}
                  poster={hero.poster.src}
                  title="REACH community highlights"
                  className="aspect-[9/16] rounded-[1.5rem]"
                />
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 text-ink shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Users size={20} />
                  </span>

                  <div>
                    <p className="text-xl font-extrabold">
                      {leaders.length}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Public profiles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          QUICK ACTIONS
      ============================================================ */}
      <section className="relative bg-white">
        <Container className="relative z-10 -mt-7 pb-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group rounded-2xl border p-5 shadow-lg shadow-slate-900/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                  action.featured
                    ? "border-brand-200 bg-brand-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition ${
                      action.featured
                        ? "bg-brand-600 text-white group-hover:bg-brand-700"
                        : "bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white"
                    }`}
                  >
                    {action.icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold text-ink">
                      {action.title}
                    </span>

                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                      {action.description}
                    </span>
                  </span>

                  <ChevronRight
                    size={18}
                    className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                  />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================
          SERVICE DISCOVERY
      ============================================================ */}
      <section className="bg-white">
        <Container className="py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <div>
              <Eyebrow>
                A simpler way to engage
              </Eyebrow>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
                Start with what you need.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                You should not need to know which government
                office handles an issue before asking for help.
                REACH helps connect your request to the
                appropriate service pathway.
              </p>

              <div className="mt-8">
                <ButtonLink
                  href="/requests/new"
                  size="lg"
                  arrow
                >
                  Find who handles this
                </ButtonLink>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ServiceTile
                icon={<Search size={22} />}
                title="Find a service"
                text="Discover programmes, opportunities and public services."
                href="/programmes"
              />

              <ServiceTile
                icon={<MessageCircle size={22} />}
                title="Ask for help"
                text="Submit a request and receive a reference number."
                href="/requests/new"
              />

              <ServiceTile
                icon={<FileText size={22} />}
                title="Track your request"
                text="Follow updates from the responsible office."
                href="/requests"
              />

              <ServiceTile
                icon={<FolderKanban size={22} />}
                title="Follow projects"
                text="See public projects and their current status."
                href="/projects"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          HOW IT WORKS
      ============================================================ */}
      <section className="border-y border-slate-100 bg-slate-50">
        <Container className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>How REACH works</Eyebrow>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl">
              From question to action.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              A straightforward digital path for residents and
              public offices.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <ProcessCard
              number="01"
              icon={<Search size={22} />}
              title="Discover"
              text="Find programmes, opportunities, services and community information."
            />

            <ProcessCard
              number="02"
              icon={<MessageCircle size={22} />}
              title="Engage"
              text="Submit a request, apply for an opportunity or connect with the appropriate office."
            />

            <ProcessCard
              number="03"
              icon={<CheckCircle2 size={22} />}
              title="Track"
              text="Keep your reference number and follow updates as your request progresses."
            />
          </div>
        </Container>
      </section>

      {/* ============================================================
          MEDIA / COMMUNITY
      ============================================================ */}
      <section className="bg-white">
        <Container className="py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <Eyebrow>
                Life in the community
              </Eyebrow>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl">
                See the people and places behind the services.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Explore community activities, outreach and
                initiatives through photos and short videos.
              </p>

              <div className="mt-7">
                <TextLink href="/stories">
                  Explore community stories
                </TextLink>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {gallery.slice(0, 3).map((photo, index) => (
                <PhotoFrame
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  aspect={
                    index === 0
                      ? "col-span-2 aspect-[2/1]"
                      : "aspect-square"
                  }
                  sizes={
                    index === 0
                      ? "(min-width: 1024px) 650px, 100vw"
                      : "(min-width: 1024px) 320px, 50vw"
                  }
                  className="rounded-3xl"
                >
                  <div className="absolute inset-0 bg-linear-to-t from-ink/35 to-transparent" />
                </PhotoFrame>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          PROGRAMMES
      ============================================================ */}
      <section className="border-y border-slate-100 bg-slate-50">
        <Container className="py-16 md:py-24">
          <SectionHeader
            eyebrow="Programmes"
            title="What is available right now?"
            text="Programmes and initiatives currently published on REACH by the offices and leaders serving your community."
            action={
              <TextLink href="/programmes">
                View all programmes
              </TextLink>
            }
          />

          {publishedProgrammes.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {publishedProgrammes.map((programme) => (
                <ContentCard
                  key={programme.id}
                  href={`/programmes/${programme.slug}`}
                  title={programme.title}
                  summary={programme.summary}
                  image={programme.image_url}
                  attribution={programme.attribution}
                  fallbackIcon={
                    <ClipboardList size={28} />
                  }
                  badges={[
                    {
                      label:
                        programme.category ||
                        "Programme",
                    },
                  ]}
                  meta={[
                    programme.location && {
                      icon: <MapPin size={14} />,
                      text: programme.location,
                    },
                    programme.registration_deadline && {
                      icon: (
                        <CalendarDays size={14} />
                      ),
                      text: `Apply by ${formatDate(
                        programme.registration_deadline,
                      )}`,
                    },
                  ].filter(
                    Boolean,
                  ) as {
                    icon: React.ReactNode;
                    text: string;
                  }[]}
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
                action={
                  <ButtonLink href="/programmes">
                    Browse programmes
                  </ButtonLink>
                }
              />
            </div>
          )}
        </Container>
      </section>

      {/* ============================================================
          OPPORTUNITIES
      ============================================================ */}
      <section className="bg-white">
        <Container className="py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>Opportunities</Eyebrow>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl">
                Scholarships, training and support.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Keep an eye on opportunities published through
                the civic network.
              </p>

              {publishedOpportunities.length > 0 ? (
                <div className="mt-8 divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white">
                  {publishedOpportunities.map(
                    (opportunity) => (
                      <Link
                        key={opportunity.id}
                        href={`/opportunities/${opportunity.slug}`}
                        className="group flex gap-4 p-5 transition hover:bg-brand-50/50"
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white">
                          <Sparkles size={20} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block font-extrabold text-ink group-hover:text-brand-800">
                            {opportunity.title}
                          </span>

                          <span className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge tone="brand">
                              {humanize(
                                opportunity.type,
                                "Opportunity",
                              )}
                            </Badge>

                            <span className="text-xs text-slate-500">
                              {opportunity.deadline
                                ? `Deadline ${formatDate(
                                    opportunity.deadline,
                                  )}`
                                : opportunity.location ||
                                  "Open to residents"}
                            </span>
                          </span>
                        </span>

                        <ArrowRight
                          size={18}
                          className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                        />
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                  Opportunities will be listed here as they
                  are published.
                </div>
              )}

              <TextLink
                href="/opportunities"
                className="mt-5"
              >
                View all opportunities
              </TextLink>
            </div>

            {/* Project panel */}
            <div>
              <Eyebrow>
                Community projects
              </Eyebrow>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl">
                Follow what is being delivered.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Public project information gives residents a
                clearer view of work being tracked through the
                office.
              </p>

              {publishedProjects.length > 0 ? (
                <div className="mt-8 divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white">
                  {publishedProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="group flex gap-4 p-5 transition hover:bg-brand-50/50"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white">
                        <FolderKanban size={20} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-extrabold text-ink group-hover:text-brand-800">
                          {project.title}
                        </span>

                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            tone={statusTone(
                              project.status,
                            )}
                          >
                            {humanize(
                              project.status,
                              "Project",
                            )}
                          </Badge>

                          <span className="text-xs text-slate-500">
                            {project.location ||
                              project.category ||
                              "Community project"}
                          </span>
                        </span>
                      </span>

                      <ArrowRight
                        size={18}
                        className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                  Community projects will be listed here as
                  they are published.
                </div>
              )}

              <TextLink
                href="/projects"
                className="mt-5"
              >
                View all projects
              </TextLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          EVENTS
      ============================================================ */}
      {publishedEvents.length > 0 && (
        <section className="border-y border-slate-100 bg-slate-50">
          <Container className="py-16 md:py-24">
            <SectionHeader
              eyebrow="Upcoming events"
              title="Stay connected to community activities."
              text="Find upcoming outreach, meetings, programmes and other public activities."
              action={
                <TextLink href="/events">
                  View all events
                </TextLink>
              }
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {publishedEvents.map((event) => (
                <ContentCard
                  key={event.id}
                  href={`/events/${event.slug}`}
                  title={event.title}
                  summary={event.summary}
                  image={event.image_url}
                  attribution={event.attribution}
                  fallbackIcon={
                    <CalendarDays size={28} />
                  }
                  badges={[
                    {
                      label:
                        event.category || "Event",
                    },
                    ...(event.is_featured
                      ? [
                          {
                            label: "Featured",
                            tone: "gold" as const,
                          },
                        ]
                      : []),
                  ]}
                  meta={[
                    {
                      icon: (
                        <CalendarDays size={14} />
                      ),
                      text:
                        formatDate(event.starts_at) ||
                        "",
                    },
                    {
                      icon: <Clock3 size={14} />,
                      text:
                        formatTime(event.starts_at) ||
                        "",
                    },
                    ...((event.venue ||
                      event.location)
                      ? [
                          {
                            icon: (
                              <MapPin size={14} />
                            ),
                            text:
                              event.venue ||
                              event.location ||
                              "",
                          },
                        ]
                      : []),
                  ]}
                  cta="Event details"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ============================================================
          STORIES
      ============================================================ */}
      {stories.length > 0 && (
        <section className="bg-ink">
          <Container className="py-16 md:py-24">
            <div className="max-w-2xl">
              <Eyebrow tone="light">
                From the community
              </Eyebrow>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl">
                See the office in action.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
                Short videos and community moments from
                programmes, activities and outreach.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.slice(0, 3).map((story) => (
                <figure key={story.src}>
                  <VideoPlayer
                    src={story.src}
                    poster={story.poster}
                    title={story.title}
                    className="aspect-[4/5] rounded-3xl ring-1 ring-white/10"
                  />

                  <figcaption className="mt-4">
                    <p className="font-extrabold text-white">
                      {story.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {story.caption}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ============================================================
          LEADERSHIP
      ============================================================ */}
      <section className="bg-white">
        <Container className="py-16 md:py-24">
          <SectionHeader
            eyebrow="Public leadership & offices"
            title="Know the offices connected to your community."
            text="Explore public profiles, responsibilities and official reference information."
            action={
              <TextLink href="/leadership">
                View all profiles
              </TextLink>
            }
          />

          {featuredLeaders.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredLeaders.map((leader) => (
                <article
                  key={leader.slug}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    {leader.image_url ? (
                      <Photo
                        src={leader.image_url}
                        alt={`${leader.name}, ${leader.role}`}
                        sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                        className="object-top transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-linear-to-br from-brand-500 to-brand-800 text-4xl font-extrabold text-white">
                        {initials(leader.name)}
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/60 to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-extrabold leading-tight text-ink">
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

                    {leader.office && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {leader.office}
                      </p>
                    )}

                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-ink">
                      View profile
                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                icon={<Users size={28} />}
                title="Leadership profiles coming soon"
                text="Public office profiles will appear here as they are published."
                action={
                  <ButtonLink href="/leadership">
                    View leadership
                  </ButtonLink>
                }
              />
            </div>
          )}
        </Container>
      </section>

      {/* ============================================================
          REQUEST CTA
      ============================================================ */}
      <section className="bg-white">
        <Container className="pb-16 md:pb-24">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-950 text-white">
            <Photo
              src={photos.officeMeeting.src}
              alt=""
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="-z-30"
            />

            <div className="absolute inset-0 -z-20 bg-brand-950/80" />

            <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950 via-brand-950/90 to-brand-900/60" />

            <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:p-16">
              <div className="max-w-2xl">
                <Eyebrow tone="light">
                  Need assistance?
                </Eyebrow>

                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
                  Tell the office what you need.
                </h2>

                <p className="mt-4 text-base leading-7 text-brand-100 sm:text-lg">
                  Submit a service request through REACH.
                  You will receive a
                  reference number that you can use to
                  follow its progress.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 text-sm text-brand-100">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Simple request form
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck size={16} />
                    Secure account
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <FileText size={16} />
                    Reference number
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <ButtonLink
                  href="/requests/new"
                  variant="light"
                  size="lg"
                  arrow
                >
                  Start a request
                </ButtonLink>

                <ButtonLink
                  href="/requests"
                  variant="outlineLight"
                  size="lg"
                >
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

/* ================================================================
   SERVICE TILE
================================================================ */

function ServiceTile({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
        {icon}
      </span>

      <h3 className="mt-5 font-extrabold text-ink">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
        Explore
        <ArrowRight
          size={15}
          className="transition group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

/* ================================================================
   PROCESS CARD
================================================================ */

function ProcessCard({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          {icon}
        </span>

        <span className="font-mono text-xs font-bold tracking-widest text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-extrabold text-ink">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {text}
      </p>
    </article>
  );
}