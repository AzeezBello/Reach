import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  ContentAttribution,
  ContentCredit,
  ContentType,
  Event,
  Jurisdiction,
  Opportunity,
  Programme,
  Project,
  ResidentRequest,
  Tenant,
} from "@/lib/types";

import { DEFAULT_TENANT_SLUG, PLATFORM_NAME } from "@/lib/config";

export { DEFAULT_TENANT_SLUG, PLATFORM_NAME, SITE_URL } from "@/lib/config";

const OPEN_PROGRAMME_STATUSES = ["open", "ongoing"];

const TENANT_FIELDS =
  "id, name, slug, description, logo_url, primary_color, secondary_color, whatsapp_number, email, phone, website";

const JURISDICTION_FIELDS = "id, name, slug, type, state, lga, lcda, ward";

/*
 * Every content row resolves its owner in the same query:
 * organization → jurisdiction → responsible office. The aliases avoid
 * clashing with the opportunities.organization text column.
 */
const ATTRIBUTION_SELECT = `
  org:organizations(id, name, slug, logo_url),
  area:jurisdictions(${JURISDICTION_FIELDS}),
  owner_office:offices(id, name, type, description, contact_email, contact_phone)
`;

const PROGRAMME_FIELDS = `id, title, slug, summary, description, category, location, start_date, end_date, registration_deadline, status, capacity, image_url, ${ATTRIBUTION_SELECT}`;

const OPPORTUNITY_FIELDS = `id, title, slug, organization, type, summary, description, application_url, deadline, location, status, image_url, ${ATTRIBUTION_SELECT}`;

const PROJECT_FIELDS = `id, title, slug, category, description, location, status, start_date, completion_date, beneficiary_count, image_url, ${ATTRIBUTION_SELECT}`;

const EVENT_FIELDS = `id, title, slug, summary, description, category, venue, location, starts_at, ends_at, registration_url, capacity, status, image_url, is_featured, ${ATTRIBUTION_SELECT}`;

const REQUEST_FIELDS =
  "id, reference_no, category, subject, description, status, created_at, updated_at";

const CREDIT_SELECT =
  "content_id, role, leader:leaders(id, slug, name, role, level, level_label, office, constituency, image_url, summary, is_active)";

function assertOk(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

type EmbeddedRow = {
  id: string;
  org?: ContentAttribution["organization"];
  area?: ContentAttribution["jurisdiction"];
  owner_office?: ContentAttribution["office"];
};

type CreditRow = {
  content_id: string;
  role: "lead" | "partner";
  leader: (ContentCredit["leader"] & { is_active: boolean | null }) | null;
};

/**
 * Attaches the explicit leader credits (content_leaders → leaders) to the
 * embedded organization, jurisdiction and office, and removes the raw
 * embed keys so the row matches the public content types.
 *
 * content_leaders is polymorphic (content_type + content_id), which
 * PostgREST cannot embed from the content table, hence one extra query
 * per listing instead of one per item.
 */
async function withAttribution<T extends { id: string }>(
  type: ContentType,
  rows: EmbeddedRow[]
): Promise<(T & { attribution: ContentAttribution })[]> {
  const credits = new Map<string, ContentCredit[]>();

  if (rows.length > 0) {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("content_leaders")
      .select(CREDIT_SELECT)
      .eq("content_type", type)
      .in(
        "content_id",
        rows.map((row) => row.id)
      );

    for (const row of (data ?? []) as unknown as CreditRow[]) {
      if (!row.leader || row.leader.is_active === false) continue;

      const { is_active: _active, ...leader } = row.leader;
      const list = credits.get(row.content_id) ?? [];
      list.push({ role: row.role, leader });
      credits.set(row.content_id, list);
    }

    for (const list of credits.values()) {
      list.sort((a, b) => (a.role === b.role ? 0 : a.role === "lead" ? -1 : 1));
    }
  }

  return rows.map((row) => {
    const { org, area, owner_office, ...rest } = row;

    return {
      ...(rest as unknown as T),
      attribution: {
        organization: org ?? null,
        jurisdiction: area ?? null,
        office: owner_office ?? null,
        leaders: credits.get(row.id) ?? [],
      },
    };
  });
}

/**
 * Resolves the platform's home organization and its primary jurisdiction.
 * Used for site chrome, contact details and structured data. Content is
 * published platform-wide, so this does not scope the listings.
 */
export const getTenant = cache(async (slug: string = DEFAULT_TENANT_SLUG) => {
  const supabase = createPublicClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("organizations")
    .select(TENANT_FIELDS)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  assertOk(tenantError);

  if (!tenant) {
    throw new Error(`No active organization found for slug "${slug}".`);
  }

  const { data: office, error: officeError } = await supabase
    .from("offices")
    .select("jurisdiction_id")
    .eq("organization_id", tenant.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  assertOk(officeError);

  let jurisdiction: Jurisdiction | null = null;

  if (office?.jurisdiction_id) {
    const { data, error } = await supabase
      .from("jurisdictions")
      .select(JURISDICTION_FIELDS)
      .eq("id", office.jurisdiction_id)
      .single();

    assertOk(error);

    jurisdiction = data as Jurisdiction;
  }

  return { tenant: tenant as Tenant, jurisdiction };
});

/**
 * Everything the public pages need. Content from every organization on the
 * platform is included; each item carries its own attribution.
 */
export const getPublicData = cache(async (slug: string = DEFAULT_TENANT_SLUG) => {
  const { tenant, jurisdiction } = await getTenant(slug);
  const supabase = createPublicClient();

  const [programmes, opportunities, projects, events] = await Promise.all([
    supabase
      .from("programmes")
      .select(PROGRAMME_FIELDS)
      .in("status", OPEN_PROGRAMME_STATUSES)
      .order("created_at", { ascending: false }),
    supabase
      .from("opportunities")
      .select(OPPORTUNITY_FIELDS)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase.from("projects").select(PROJECT_FIELDS).order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select(EVENT_FIELDS)
      .eq("status", "published")
      .order("starts_at", { ascending: true }),
  ]);

  assertOk(programmes.error);
  assertOk(opportunities.error);
  assertOk(projects.error);

  const [programmeRows, opportunityRows, projectRows, eventRows] = await Promise.all([
    withAttribution<Programme>("programme", (programmes.data ?? []) as unknown as EmbeddedRow[]),
    withAttribution<Opportunity>("opportunity", (opportunities.data ?? []) as unknown as EmbeddedRow[]),
    withAttribution<Project>("project", (projects.data ?? []) as unknown as EmbeddedRow[]),
    withAttribution<Event>("event", (events.error ? [] : (events.data ?? [])) as unknown as EmbeddedRow[]),
  ]);

  return {
    platform: PLATFORM_NAME,
    tenant,
    jurisdiction,
    programmes: programmeRows,
    opportunities: opportunityRows,
    projects: projectRows,
    events: eventRows,
  };
});

/*
 * Detail lookups. Slugs are unique per organization, so the first published
 * match wins when two organizations reuse one slug.
 */

async function findOne<T extends { id: string }>(
  type: ContentType,
  query: PromiseLike<{ data: unknown; error: { message: string } | null }>
) {
  const { data, error } = await query;

  if (error || !data) return null;

  const [item] = await withAttribution<T>(type, [data as unknown as EmbeddedRow]);

  return item ?? null;
}

export async function getProgramme(slug: string) {
  const supabase = createPublicClient();

  return findOne<Programme>(
    "programme",
    supabase
      .from("programmes")
      .select(PROGRAMME_FIELDS)
      .eq("slug", slug)
      .in("status", OPEN_PROGRAMME_STATUSES)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
  );
}

export async function getOpportunity(slug: string) {
  const supabase = createPublicClient();

  return findOne<Opportunity>(
    "opportunity",
    supabase
      .from("opportunities")
      .select(OPPORTUNITY_FIELDS)
      .eq("slug", slug)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
  );
}

export async function getProject(slug: string) {
  const supabase = createPublicClient();

  return findOne<Project>(
    "project",
    supabase
      .from("projects")
      .select(PROJECT_FIELDS)
      .eq("slug", slug)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
  );
}

export async function getEvent(slug: string) {
  const supabase = createPublicClient();

  return findOne<Event>(
    "event",
    supabase
      .from("events")
      .select(EVENT_FIELDS)
      .eq("slug", slug)
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
  );
}

/** Published events split into upcoming and past, soonest first. */
export function splitEvents(events: Event[], now = new Date()) {
  const upcoming = events.filter(
    (event) => new Date(event.ends_at ?? event.starts_at) >= now
  );
  const past = events
    .filter((event) => new Date(event.ends_at ?? event.starts_at) < now)
    .reverse();

  return { upcoming, past };
}

/*
 * Resident session helpers.
 */

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/** Requests owned by the signed-in resident (enforced by RLS). */
export async function getMyRequests(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requests")
    .select(REQUEST_FIELDS)
    .eq("resident_id", userId)
    .order("created_at", { ascending: false });

  assertOk(error);

  return (data ?? []) as ResidentRequest[];
}
