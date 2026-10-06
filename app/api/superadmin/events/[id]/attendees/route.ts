import { NextResponse } from "next/server";

import { getSuperadminAccess } from "@/lib/admin";
import { getContent, getEventAttendees } from "@/lib/content-admin";

function csvCell(value: string | null | undefined) {
  const text = value ?? "";
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Attendee list for one event as a CSV download (platform admins only). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await getSuperadminAccess();

  if (!access.user || !access.allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const event = await getContent("event", id);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const attendees = await getEventAttendees(id);

  const lines = [
    ["Name", "Email", "Phone", "RSVP date"].join(","),
    ...attendees.map((attendee) =>
      [
        csvCell(attendee.full_name),
        csvCell(attendee.email),
        csvCell(attendee.phone),
        csvCell(new Date(attendee.rsvp_at).toISOString()),
      ].join(",")
    ),
  ];

  const filename = `${event.slug}-attendees.csv`;

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
