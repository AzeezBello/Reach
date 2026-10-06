import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";

import { ActionForm } from "@/components/action-form";
import { CtaBand, DetailBody, DetailHero } from "@/components/detail";
import { JsonLd } from "@/components/json-ld";
import { LeadersInvolved } from "@/components/leaders-panel";
import { Badge, ButtonLink, FactRow } from "@/components/ui";
import { formatDate, formatNumber, formatTime } from "@/lib/format";
import { getContentLeaders } from "@/lib/leaders";
import { getCurrentUser, getEvent, getTenant } from "@/lib/reach";
import { eventSchema } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

import { toggleRsvp } from "../actions";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description:
      event.summary ?? `${event.title}, an event organised by the constituency office.`,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: event.image_url
      ? { images: [{ url: event.image_url, alt: event.title }] }
      : undefined,
  };
}

async function getRsvpState(eventId: string, userId: string | null) {
  const supabase = await createClient();

  const [{ data: count }, attending] = await Promise.all([
    supabase.rpc("event_rsvp_count", { target_event: eventId }),
    userId
      ? supabase
          .from("event_rsvps")
          .select("event_id")
          .eq("event_id", eventId)
          .eq("resident_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    count: typeof count === "number" ? count : 0,
    attending: Boolean(attending.data),
  };
}

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params;
  const [event, { tenant, jurisdiction }, user] = await Promise.all([
    getEvent(slug),
    getTenant(),
    getCurrentUser(),
  ]);

  if (!event) {
    notFound();
  }

  const [credits, rsvp] = await Promise.all([
    getContentLeaders("event", event.id),
    getRsvpState(event.id, user?.id ?? null),
  ]);

  const isPast = new Date(event.ends_at ?? event.starts_at) < new Date();
  const sameDay =
    event.ends_at && formatDate(event.ends_at) === formatDate(event.starts_at);

  const facts = [
    {
      icon: <CalendarDays size={18} />,
      label: "Date",
      value:
        event.ends_at && !sameDay
          ? `${formatDate(event.starts_at, "long")} – ${formatDate(event.ends_at, "long")}`
          : formatDate(event.starts_at, "long") ?? "",
    },
    {
      icon: <Clock size={18} />,
      label: "Time",
      value: event.ends_at
        ? `${formatTime(event.starts_at)} – ${formatTime(event.ends_at)}`
        : formatTime(event.starts_at) ?? "",
    },
    (event.venue || event.location) && {
      icon: <MapPin size={18} />,
      label: "Venue",
      value: [event.venue, event.location].filter(Boolean).join(", "),
    },
    event.capacity && {
      icon: <Users size={18} />,
      label: "Capacity",
      value: `${formatNumber(event.capacity)} attendees`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <>
      <JsonLd data={eventSchema(event, tenant, jurisdiction)} />

      <DetailHero
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: event.title, href: `/events/${event.slug}` },
        ]}
        image={event.image_url}
        imageAlt={event.title}
        fallbackIcon={<CalendarDays size={34} />}
        badges={
          <>
            <Badge>{event.category || "Event"}</Badge>
            {event.is_featured && !isPast && <Badge tone="gold">Featured</Badge>}
            {isPast && <Badge tone="slate">Past event</Badge>}
            {event.status === "cancelled" && <Badge tone="ink">Cancelled</Badge>}
          </>
        }
        title={event.title}
        summary={event.summary}
      />

      <DetailBody
        eyebrow="About this event"
        heading="Event details"
        description={event.description}
        emptyText="More information about this event will be published soon."
        aside={
          <>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Event information
            </p>

            <div className="mt-6 space-y-5">
              {facts.map((fact) => (
                <FactRow key={fact.label} {...fact} />
              ))}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              {rsvp.count > 0 && (
                <p className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-brand-800">
                  <CheckCircle2 size={16} />
                  {formatNumber(rsvp.count)} resident{rsvp.count === 1 ? "" : "s"} attending
                </p>
              )}

              {isPast ? (
                <p className="text-sm leading-6 text-slate-600">
                  This event has taken place. Check the events page for what is
                  coming up next.
                </p>
              ) : user ? (
                <ActionForm
                  action={toggleRsvp}
                  submitLabel={rsvp.attending ? "Cancel my RSVP" : "I'm attending"}
                  pendingLabel="Saving…"
                  variant={rsvp.attending ? "outline" : "primary"}
                  className="gap-3"
                >
                  <input type="hidden" name="event_id" value={event.id} />
                  <input type="hidden" name="slug" value={event.slug} />
                  <input type="hidden" name="attending" value={rsvp.attending ? "true" : "false"} />
                </ActionForm>
              ) : (
                <ButtonLink href={`/login?next=/events/${event.slug}`} className="w-full">
                  Sign in to RSVP
                </ButtonLink>
              )}

              {event.registration_url && !isPast && (
                <ButtonLink
                  href={event.registration_url}
                  external={event.registration_url.startsWith("http")}
                  variant="outline"
                  className="mt-3 w-full"
                >
                  Register
                  <ExternalLink size={16} />
                </ButtonLink>
              )}
            </div>

          </>
        }
      >
        <LeadersInvolved credits={credits} itemLabel="event" />
      </DetailBody>

      <CtaBand
        eyebrow="More from the office"
        title="See what else is happening in your community."
        text="Explore programmes, opportunities and other events published through this office."
      >
        <ButtonLink href="/events" variant="light">
          All events
        </ButtonLink>
        <ButtonLink href="/programmes" variant="outlineLight">
          View programmes
        </ButtonLink>
      </CtaBand>
    </>
  );
}
