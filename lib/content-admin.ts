import { createAdminClient } from "@/lib/supabase/admin-client";
import { requireSuperadmin } from "@/lib/admin";
import type { ContentType, Profile } from "@/lib/types";

/*
 * Content administration: programmes, opportunities, projects and events.
 *
 * Every function verifies platform-admin access first and then uses the
 * server-only service-role client, because the hosted database's RLS does
 * not grant admin sessions write access to content tables.
 */

export type ContentKind = ContentType;

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "datetime" | "number" | "url" | "select" | "checkbox";
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
  placeholder?: string;
  full?: boolean;
};

export type KindConfig = {
  table: "programmes" | "opportunities" | "projects" | "events";
  label: string;
  plural: string;
  publicPath: string;
  statuses: string[];
  /** Statuses that make the item visible to residents. */
  publishedStatuses: string[];
  /** Status used by "Publish". */
  publishStatus: string;
  /** Status used by "Unpublish" (null when the kind has no hidden state). */
  unpublishStatus: string | null;
  /** Status used by "Archive" (null when the kind cannot be archived). */
  archiveStatus: string | null;
  fields: FieldDef[];
};

const OPPORTUNITY_TYPES = [
  "scholarship",
  "job",
  "training",
  "grant",
  "internship",
  "business_support",
  "other",
];

export const CONTENT_KINDS: Record<ContentKind, KindConfig> = {
  programme: {
    table: "programmes",
    label: "Programme",
    plural: "Programmes",
    publicPath: "/programmes",
    statuses: ["draft", "open", "ongoing", "completed", "archived"],
    publishedStatuses: ["open", "ongoing"],
    publishStatus: "open",
    unpublishStatus: "draft",
    archiveStatus: "archived",
    fields: [
      { name: "category", label: "Category", type: "text", placeholder: "e.g. Education & Skills" },
      { name: "location", label: "Location", type: "text", placeholder: "Surulere, Lagos" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "registration_deadline", label: "Registration deadline", type: "date" },
      { name: "capacity", label: "Capacity", type: "number", hint: "Leave empty for no limit." },
    ],
  },
  opportunity: {
    table: "opportunities",
    label: "Opportunity",
    plural: "Opportunities",
    publicPath: "/opportunities",
    statuses: ["draft", "active", "closed", "archived"],
    publishedStatuses: ["active"],
    publishStatus: "active",
    unpublishStatus: "draft",
    archiveStatus: "archived",
    fields: [
      {
        name: "type",
        label: "Opportunity type",
        type: "select",
        required: true,
        options: OPPORTUNITY_TYPES.map((value) => ({
          value,
          label: value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        })),
      },
      { name: "organization", label: "Provided by", type: "text", placeholder: "Organisation offering this opportunity" },
      { name: "application_url", label: "Application URL", type: "url", placeholder: "https://…" },
      { name: "deadline", label: "Deadline", type: "date" },
      { name: "location", label: "Location", type: "text" },
    ],
  },
  project: {
    table: "projects",
    label: "Project",
    plural: "Projects",
    publicPath: "/projects",
    statuses: ["planned", "ongoing", "completed"],
    publishedStatuses: ["planned", "ongoing", "completed"],
    publishStatus: "ongoing",
    unpublishStatus: null,
    archiveStatus: null,
    fields: [
      { name: "category", label: "Category", type: "text", placeholder: "e.g. Infrastructure" },
      { name: "location", label: "Location", type: "text" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "completion_date", label: "Completion date", type: "date" },
      { name: "beneficiary_count", label: "Beneficiaries", type: "number" },
    ],
  },
  event: {
    table: "events",
    label: "Event",
    plural: "Events",
    publicPath: "/events",
    statuses: ["draft", "published", "cancelled"],
    publishedStatuses: ["published"],
    publishStatus: "published",
    unpublishStatus: "draft",
    archiveStatus: "cancelled",
    fields: [
      { name: "category", label: "Category", type: "text", placeholder: "e.g. Education" },
      { name: "starts_at", label: "Starts", type: "datetime", required: true },
      { name: "ends_at", label: "Ends", type: "datetime" },
      { name: "venue", label: "Venue", type: "text", placeholder: "e.g. Teslim Balogun Stadium" },
      { name: "location", label: "Location", type: "text", placeholder: "Surulere, Lagos" },
      { name: "registration_url", label: "Registration URL", type: "url", placeholder: "https://…" },
      { name: "capacity", label: "Capacity", type: "number", hint: "Leave empty for no limit." },
      { name: "is_featured", label: "Featured on the homepage", type: "checkbox" },
    ],
  },
};

export const CONTENT_KIND_KEYS = Object.keys(CONTENT_KINDS) as ContentKind[];

export function isContentKind(value: string): value is ContentKind {
  return value in CONTENT_KINDS;
}

/** Kinds that have a `summary` column. */
export function hasSummary(kind: ContentKind) {
  return kind !== "project";
}

export type ContentRow = {
  id: string;
  title: string;
  slug: string;
  status: string | null;
  organization_id: string;
  jurisdiction_id: string | null;
  image_url: string | null;
  summary?: string | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  [key: string]: unknown;
};

export async function listContent(kind: ContentKind): Promise<ContentRow[]> {
  await requireSuperadmin();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(CONTENT_KINDS[kind].table)
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load ${CONTENT_KINDS[kind].plural.toLowerCase()}: ${error.message}`);
  }

  return (data ?? []) as ContentRow[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getContent(kind: ContentKind, id: string): Promise<ContentRow | null> {
  await requireSuperadmin();

  if (!UUID.test(id)) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(CONTENT_KINDS[kind].table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ContentRow | null) ?? null;
}

/** Leader credits for one item: leader id → role. */
export async function getContentCredits(kind: ContentKind, id: string) {
  await requireSuperadmin();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("content_leaders")
    .select("leader_id, role")
    .eq("content_type", kind)
    .eq("content_id", id);

  return new Map(((data ?? []) as { leader_id: string; role: string }[]).map((row) => [row.leader_id, row.role]));
}

/** RSVP totals for every event, keyed by event id. */
export async function getRsvpCounts() {
  await requireSuperadmin();

  const supabase = createAdminClient();
  const { data } = await supabase.from("event_rsvps").select("event_id");

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { event_id: string }[]) {
    counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
  }

  return counts;
}

export type Attendee = Pick<Profile, "id" | "full_name" | "email" | "phone"> & {
  rsvp_at: string;
};

/** Attendees for one event, newest RSVP first. */
export async function getEventAttendees(eventId: string): Promise<Attendee[]> {
  await requireSuperadmin();

  const supabase = createAdminClient();
  const { data: rsvps, error } = await supabase
    .from("event_rsvps")
    .select("resident_id, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (rsvps ?? []) as { resident_id: string; created_at: string }[];
  if (rows.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .in("id", rows.map((row) => row.resident_id));

  const byId = new Map(
    ((profiles ?? []) as Pick<Profile, "id" | "full_name" | "email" | "phone">[]).map((p) => [p.id, p])
  );

  return rows.map((row) => ({
    id: row.resident_id,
    full_name: byId.get(row.resident_id)?.full_name ?? null,
    email: byId.get(row.resident_id)?.email ?? null,
    phone: byId.get(row.resident_id)?.phone ?? null,
    rsvp_at: row.created_at,
  }));
}

/* ------------------------------------------------------------------ */
/* Date helpers (Lagos is UTC+1 all year)                              */
/* ------------------------------------------------------------------ */

const LAGOS_OFFSET = "+01:00";

/** ISO timestamp → value for an `<input type="datetime-local">` in Lagos time. */
export function toLagosInput(iso: string | null | undefined) {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const shifted = new Date(date.getTime() + 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

/** `datetime-local` value entered in Lagos time → ISO timestamp. */
export function fromLagosInput(value: string) {
  if (!value) return null;

  const date = new Date(`${value}:00${LAGOS_OFFSET}`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Enter a valid date and time.");
  }

  return date.toISOString();
}
