import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Download, Users } from "lucide-react";

import { AdminHeader, Panel, StatCard, StatusBadge, Table, cell } from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink } from "@/components/ui";
import { requireSuperadmin } from "@/lib/admin";
import { getContent, getEventAttendees } from "@/lib/content-admin";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Event RSVPs" };

export default async function EventRsvpsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperadmin();

  const { id } = await params;
  const event = await getContent("event", id);

  if (!event) {
    notFound();
  }

  const attendees = await getEventAttendees(id);
  const capacity = event.capacity as number | null;
  const remaining = capacity === null ? null : Math.max(capacity - attendees.length, 0);
  const isPast = new Date((event.ends_at as string | null) ?? (event.starts_at as string)) < new Date();

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Console", href: "/superadmin" },
          { label: "Events", href: "/superadmin/events" },
          { label: event.title, href: `/superadmin/events/${id}` },
        ]}
      />

      <AdminHeader
        eyebrow="Event"
        title={event.title}
        text={`${formatDateTime(event.starts_at as string)}${event.venue ? ` · ${event.venue as string}` : ""}`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={event.status} fallback="Draft" />
            <ButtonLink href={`/superadmin/content/event/${id}`} variant="outline" size="sm">
              Edit event
            </ButtonLink>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users size={20} />} label="Total RSVPs" value={attendees.length} />
        <StatCard
          icon={<Users size={20} />}
          label="Capacity"
          value={capacity === null ? "No limit" : capacity}
          hint={remaining === null ? undefined : `${remaining} place${remaining === 1 ? "" : "s"} remaining`}
        />
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Registration"
          value={event.status !== "published" ? "Hidden" : isPast ? "Closed" : "Open"}
          hint={event.registration_url ? "External registration link set" : "RSVP on the event page"}
        />
      </div>

      <Panel
        title="Attendees"
        text="Residents who have RSVPed from their account."
        action={
          attendees.length > 0 ? (
            <a
              href={`/api/superadmin/events/${id}/attendees`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-brand-400 hover:text-brand-800"
            >
              <Download size={16} /> Export CSV
            </a>
          ) : undefined
        }
      >
        <Table
          head={["Name", "Email", "Phone", "RSVP"]}
          rows={attendees.length}
          empty="No RSVPs yet."
        >
          {attendees.map((attendee) => (
            <tr key={attendee.id}>
              <td className={`${cell} font-bold text-ink`}>{attendee.full_name || "Unnamed account"}</td>
              <td className={cell}>{attendee.email ?? "—"}</td>
              <td className={cell}>{attendee.phone ?? "—"}</td>
              <td className={cell}>{formatDateTime(attendee.rsvp_at)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
