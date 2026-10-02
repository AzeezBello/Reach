import type { Metadata } from "next";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import { ContentCard } from "@/components/content-card";
import { CtaBand } from "@/components/detail";
import { PageHero } from "@/components/page-hero";
import { ButtonLink, Container, EmptyState, SectionHeader } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/format";
import { pageArt } from "@/lib/media";
import { getPublicData, splitEvents } from "@/lib/reach";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Carnivals, town halls, sports days and outreach events organised for residents by the constituency office.",
  alternates: { canonical: "/events" },
};

function eventMeta(event: Event) {
  return [
    {
      icon: <CalendarDays size={14} />,
      text: formatDate(event.starts_at) ?? "",
    },
    {
      icon: <Clock size={14} />,
      text: formatTime(event.starts_at) ?? "",
    },
    ...(event.venue || event.location
      ? [{ icon: <MapPin size={14} />, text: event.venue || event.location || "" }]
      : []),
  ];
}

export default async function EventsPage() {
  const { tenant, events } = await getPublicData();
  const { upcoming, past } = splitEvents(events);

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Events in your community"
        text={`Acada Carnival, town halls, sports days and outreach events organised by ${tenant.name}. Sign in to let the office know you are attending.`}
        image={pageArt.events}
        breadcrumbs={[{ label: "Events", href: "/events" }]}
      >
        {upcoming.length > 0 && (
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
            <span className="size-2 rounded-full bg-gold-400" />
            {upcoming.length} upcoming event{upcoming.length === 1 ? "" : "s"}
          </p>
        )}
      </PageHero>

      <Container className="py-12 md:py-16">
        {upcoming.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, index) => (
              <ContentCard
                key={event.id}
                href={`/events/${event.slug}`}
                title={event.title}
                summary={event.summary}
                image={event.image_url}
                priority={index < 3}
                fallbackIcon={<CalendarDays size={28} />}
                badges={[
                  { label: event.category || "Event" },
                  ...(event.is_featured ? [{ label: "Featured", tone: "gold" as const }] : []),
                ]}
                meta={eventMeta(event)}
                cta="Event details"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays size={28} />}
            title="No upcoming events yet"
            text="Events such as Acada Carnival, community fitness days and town halls will be listed here as soon as they are announced."
            action={<ButtonLink href="/programmes">Browse programmes</ButtonLink>}
          />
        )}

        {past.length > 0 && (
          <div className="mt-16">
            <SectionHeader
              eyebrow="Past events"
              title="Recently held"
              text="Highlights from events the office has already hosted."
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.slice(0, 6).map((event) => (
                <ContentCard
                  key={event.id}
                  href={`/events/${event.slug}`}
                  title={event.title}
                  summary={event.summary}
                  image={event.image_url}
                  fallbackIcon={<CalendarDays size={28} />}
                  badges={[{ label: "Past event", tone: "slate" }]}
                  meta={eventMeta(event)}
                  cta="See details"
                />
              ))}
            </div>
          </div>
        )}
      </Container>

      <CtaBand
        eyebrow="Want to host or suggest an event?"
        title="Tell the office about it."
        text="Community groups, schools and associations can propose events or request support through a service request."
      >
        <ButtonLink href="/requests/new" variant="light" arrow>
          Submit a request
        </ButtonLink>
      </CtaBand>
    </>
  );
}
