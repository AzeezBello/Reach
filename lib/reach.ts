import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type {
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

const PROGRAMME_FIELDS =
  "id, title, slug, summary, description, category, location, start_date, end_date, registration_deadline, status, capacity, image_url";

const OPPORTUNITY_FIELDS =
  "id, title, slug, organization, type, summary, description, application_url, deadline, location, status, image_url";

const PROJECT_FIELDS =
  "id, title, slug, category, description, location, status, start_date, completion_date, beneficiary_count, image_url";

const REQUEST_FIELDS =
  "id, reference_no, category, subject, description, status, created_at, updated_at";

const EVENT_FIELDS =
  "id, title, slug, summary, description, category, venue, location, starts_at, ends_at, registration_url, capacity, status, image_url, is_featured";

function assertOk(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Resolves the active tenant and its primary jurisdiction.
 * Wrapped in `cache` so the layout and the page share one lookup per request.
 */
export const getTenant = cache(async (slug: string = DEFAULT_TENANT_SLUG) => {
  const supabase = await createClient();

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

/** Everything the public pages need for the current tenant. */
export const getPublicData = cache(
  async (slug: string = DEFAULT_TENANT_SLUG) => {
    const { tenant, jurisdiction } = await getTenant(slug);
    const supabase = await createClient();

    const [programmes, opportunities, projects, events] = await Promise.all([
      supabase
        .from("programmes")
        .select(PROGRAMME_FIELDS)
        .eq("organization_id", tenant.id)
        .in("status", OPEN_PROGRAMME_STATUSES)
        .order("created_at", { ascending: false }),
      supabase
        .from("opportunities")
        .select(OPPORTUNITY_FIELDS)
        .eq("organization_id", tenant.id)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("projects")
        .select(PROJECT_FIELDS)
        .eq("organization_id", tenant.id)
        .order("created_at", { ascending: false }),
      // Events are optional until the events migration has been applied.
      supabase
        .from("events")
        .select(EVENT_FIELDS)
        .eq("organization_id", tenant.id)
        .eq("status", "published")
        .order("starts_at", { ascending: true }),
    ]);

    assertOk(programmes.error);
    assertOk(opportunities.error);
    assertOk(projects.error);

    return {
      platform: PLATFORM_NAME,
      tenant,
      jurisdiction,
      programmes: (programmes.data ?? []) as Programme[],
      opportunities: (opportunities.data ?? []) as Opportunity[],
      projects: (projects.data ?? []) as Project[],
      events: (events.error ? [] : (events.data ?? [])) as Event[],
    };
  }
);

/*
 * Detail lookups. Every query is scoped by organization_id so a slug from
 * another tenant can never be displayed.
 */

export async function getProgramme(slug: string) {
  const { tenant } = await getTenant();
  const supabase = await createClient();

  const { data } = await supabase
    .from("programmes")
    .select(PROGRAMME_FIELDS)
    .eq("organization_id", tenant.id)
    .eq("slug", slug)
    .in("status", OPEN_PROGRAMME_STATUSES)
    .maybeSingle();

  return (data as Programme | null) ?? null;
}

export async function getOpportunity(slug: string) {
  const { tenant } = await getTenant();
  const supabase = await createClient();

  const { data } = await supabase
    .from("opportunities")
    .select(OPPORTUNITY_FIELDS)
    .eq("organization_id", tenant.id)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  return (data as Opportunity | null) ?? null;
}

export async function getProject(slug: string) {
  const { tenant } = await getTenant();
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("organization_id", tenant.id)
    .eq("slug", slug)
    .maybeSingle();

  return (data as Project | null) ?? null;
}

export async function getEvent(slug: string) {
  const { tenant } = await getTenant();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_FIELDS)
    .eq("organization_id", tenant.id)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) return null;

  return (data as Event | null) ?? null;
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
