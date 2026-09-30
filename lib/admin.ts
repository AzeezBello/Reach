import { redirect } from "next/navigation";
import { cache } from "react";

import { getCurrentUser } from "@/lib/reach";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminRequest,
  JurisdictionRecord,
  Notification,
  Office,
  OfficeMember,
  Organization,
  Profile,
  ProgrammeApplication,
  RequestUpdate,
  ResidentRequest,
} from "@/lib/types";

/** Profile roles that may open the superadmin console. */
export const SUPERADMIN_ROLES = ["admin", "superadmin"];

export const OPEN_REQUEST_STATUSES = ["submitted", "under_review", "in_progress"];

export const REQUEST_STATUSES = [
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
  "closed",
];

export const JURISDICTION_TYPES = [
  "state",
  "senatorial_district",
  "federal_constituency",
  "state_constituency",
  "lga",
  "lcda",
  "ward",
  "community",
];

export const OFFICE_TYPES = [
  "governor",
  "senator",
  "house_of_representatives",
  "house_of_assembly",
  "lga",
  "lcda",
  "councillor",
  "public_agency",
  "community_office",
  "other",
];

export const STAFF_ROLES = ["staff", "admin"];

const PROFILE_FIELDS = "id, full_name, role, email, phone, created_at";

const ORGANIZATION_FIELDS =
  "id, name, slug, description, logo_url, primary_color, secondary_color, whatsapp_number, email, phone, website, is_active, created_at";

const REQUEST_FIELDS =
  "id, reference_no, category, subject, description, status, created_at, updated_at";

const ADMIN_REQUEST_FIELDS = `${REQUEST_FIELDS}, resident_id, organization_id, jurisdiction_id, staff_notes`;

function assertOk(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/* Session guards                                                      */
/* ------------------------------------------------------------------ */

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  return (data as Profile | null) ?? null;
});

/** Redirects to sign-in (and back) when there is no session. */
export async function requireUser(next: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return user;
}

export const getSuperadminAccess = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, profile: null, allowed: false };
  }

  const profile = await getProfile(user.id);
  const allowed = SUPERADMIN_ROLES.includes(profile?.role ?? "");

  return { user, profile, allowed };
});

/** Every superadmin page calls this: layouts alone do not protect routes. */
export async function requireSuperadmin() {
  const access = await getSuperadminAccess();

  if (!access.user) {
    redirect("/login?next=/superadmin");
  }

  if (!access.allowed) {
    redirect("/dashboard?denied=superadmin");
  }

  return access;
}

/* ------------------------------------------------------------------ */
/* Resident dashboard                                                  */
/* ------------------------------------------------------------------ */

export async function getResidentDashboard(userId: string) {
  const supabase = await createClient();

  const [profile, requests, applications, notifications] = await Promise.all([
    getProfile(userId),
    supabase
      .from("requests")
      .select(REQUEST_FIELDS)
      .eq("resident_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("programme_applications")
      .select("id, programme_id, status, notes, created_at")
      .eq("resident_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("notifications")
      .select("id, title, message, created_at, sent_at")
      .eq("resident_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  assertOk(requests.error);

  const applicationRows = (applications.data ?? []) as ProgrammeApplication[];
  const programmeIds = [...new Set(applicationRows.map((row) => row.programme_id))];

  let programmeTitles = new Map<string, { title: string; slug: string }>();

  if (programmeIds.length > 0) {
    const { data } = await supabase
      .from("programmes")
      .select("id, title, slug")
      .in("id", programmeIds);

    programmeTitles = new Map(
      ((data ?? []) as { id: string; title: string; slug: string }[]).map(
        (row) => [row.id, { title: row.title, slug: row.slug }]
      )
    );
  }

  return {
    profile,
    requests: (requests.data ?? []) as ResidentRequest[],
    applications: applicationRows.map((row) => ({
      ...row,
      programme: programmeTitles.get(row.programme_id) ?? null,
    })),
    // Notifications are optional: an RLS denial should not break the page.
    notifications: (notifications.data ?? []) as Notification[],
  };
}

/** A single request owned by the resident, with its update timeline. */
export async function getResidentRequest(userId: string, id: string) {
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("requests")
    .select(REQUEST_FIELDS)
    .eq("id", id)
    .eq("resident_id", userId)
    .maybeSingle();

  if (!request) return null;

  const { data: updates } = await supabase
    .from("request_updates")
    .select("id, request_id, status, message, author_id, created_at")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  return {
    request: request as ResidentRequest,
    updates: (updates ?? []) as RequestUpdate[],
  };
}

/* ------------------------------------------------------------------ */
/* Platform administration                                             */
/* ------------------------------------------------------------------ */

const COUNTED_TABLES = [
  "organizations",
  "jurisdictions",
  "offices",
  "profiles",
  "programmes",
  "opportunities",
  "projects",
  "requests",
] as const;

export type PlatformStats = Record<(typeof COUNTED_TABLES)[number], number>;

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient();

  const counts = await Promise.all(
    COUNTED_TABLES.map(async (table) => {
      const { count } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true });

      return [table, count ?? 0] as const;
    })
  );

  return Object.fromEntries(counts) as PlatformStats;
}

export async function getOrganizations() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_FIELDS)
    .order("name");

  assertOk(error);

  return (data ?? []) as Organization[];
}

export async function getOrganization(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("organizations")
    .select(ORGANIZATION_FIELDS)
    .eq("id", id)
    .maybeSingle();

  return (data as Organization | null) ?? null;
}

export async function getJurisdictions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jurisdictions")
    .select("id, name, slug, type, state, lga, lcda, ward, parent_id")
    .order("name");

  assertOk(error);

  return (data ?? []) as JurisdictionRecord[];
}

export async function getOffices() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offices")
    .select(
      "id, name, type, organization_id, jurisdiction_id, is_active, description, created_at"
    )
    .order("name");

  assertOk(error);

  return (data ?? []) as Office[];
}

export async function getOfficeMembers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("office_members")
    .select("office_id, user_id, role, created_at")
    .order("created_at", { ascending: false });

  assertOk(error);

  return (data ?? []) as OfficeMember[];
}

export async function getProfilesByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, Profile>();

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .in("id", ids);

  return new Map(((data ?? []) as Profile[]).map((row) => [row.id, row]));
}

export async function getProfileByEmail(email: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .ilike("email", email)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

export async function getAllRequests(limit = 100) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requests")
    .select(ADMIN_REQUEST_FIELDS)
    .order("created_at", { ascending: false })
    .limit(limit);

  assertOk(error);

  return (data ?? []) as AdminRequest[];
}

export async function getContentCounts(organizationId: string) {
  const supabase = await createClient();

  const tables = ["programmes", "opportunities", "projects", "requests"] as const;

  const counts = await Promise.all(
    tables.map(async (table) => {
      const { count } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId);

      return [table, count ?? 0] as const;
    })
  );

  return Object.fromEntries(counts) as Record<(typeof tables)[number], number>;
}
