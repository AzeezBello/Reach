import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Plus, Users } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import { AdminHeader, Panel, StatCard, StatusBadge, Table, cell } from "@/components/admin";
import { ButtonLink } from "@/components/ui";
import { getOrganizations, requireSuperadmin } from "@/lib/admin";
import { CONTENT_KINDS, getRsvpCounts, listContent } from "@/lib/content-admin";
import { formatDateTime } from "@/lib/format";

import { setContentStatus } from "../content/actions";

export const metadata: Metadata = { title: "Events" };

export default async function EventsAdminPage() {
  await requireSuperadmin();

  const config = CONTENT_KINDS.event;

  const [events, counts, organizations] = await Promise.all([
    listContent("event"),
    getRsvpCounts(),
    getOrganizations(),
  ]);

  const organizationNames = new Map(organizations.map((org) => [org.id, org.name]));
  const now = Date.now();
  const upcoming = events.filter(
    (event) => event.status === "published" && new Date((event.ends_at as string | null) ?? (event.starts_at as string)).getTime() >= now
  );
  const totalRsvps = [...counts.values()].reduce((sum, count) => sum + count, 0);

  const sorted = [...events].sort(
    (a, b) => new Date(b.starts_at as string).getTime() - new Date(a.starts_at as string).getTime()
  );

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Events"
        title="Event management"
        text="Publish events, track RSVPs and export attendee lists."
        action={
          <ButtonLink href="/superadmin/content/event/new">
            <Plus size={16} /> Create event
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<CalendarDays size={20} />} label="Events" value={events.length} />
        <StatCard icon={<CalendarDays size={20} />} label="Upcoming & published" value={upcoming.length} />
        <StatCard icon={<Users size={20} />} label="Total RSVPs" value={totalRsvps} />
      </div>

      <Panel title="All events" text="Newest first. Open an event to see who is attending.">
        <Table
          head={["Event", "Starts", "Status", "RSVPs", "Capacity", ""]}
          rows={sorted.length}
          empty="No events yet. Create the first one."
        >
          {sorted.map((event) => {
            const rsvps = counts.get(event.id) ?? 0;
            const capacity = event.capacity as number | null;
            const isPublished = event.status === "published";
            const full = capacity !== null && rsvps >= capacity;

            return (
              <tr key={event.id}>
                <td className={cell}>
                  <Link
                    href={`/superadmin/events/${event.id}`}
                    className="block font-bold text-ink hover:text-brand-800"
                  >
                    {event.title}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {organizationNames.get(event.organization_id) ?? "—"}
                    {event.venue ? ` · ${event.venue as string}` : ""}
                  </span>
                </td>
                <td className={cell}>{formatDateTime(event.starts_at as string)}</td>
                <td className={cell}>
                  <StatusBadge status={event.status} fallback="Draft" />
                </td>
                <td className={`${cell} font-bold text-ink`}>{rsvps}</td>
                <td className={cell}>
                  {capacity === null ? "No limit" : `${capacity}${full ? " · full" : ""}`}
                </td>
                <td className={`${cell} text-right`}>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <ActionForm
                      action={setContentStatus}
                      inline
                      variant={isPublished ? "outline" : "primary"}
                      submitLabel={isPublished ? "Unpublish" : "Publish"}
                      pendingLabel="…"
                    >
                      <input type="hidden" name="kind" value="event" />
                      <input type="hidden" name="id" value={event.id} />
                      <input type="hidden" name="status" value={isPublished ? config.unpublishStatus! : config.publishStatus} />
                    </ActionForm>

                    <Link
                      href={`/superadmin/content/event/${event.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                    >
                      Edit <ArrowRight size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
