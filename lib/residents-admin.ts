import "server-only";

import { requireSuperadmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { RESIDENT_ROLES, type ResidentAccount } from "@/lib/residents";
import type { Profile } from "@/lib/types";

/*
 * Resident account administration. Profiles live in public.profiles; the
 * sign-in state (confirmation, last sign-in, suspension) lives in Supabase
 * Auth, so both are read through the service-role client after the
 * platform-admin check.
 */

export { LIMITED_ROLES, RESIDENT_ROLES } from "@/lib/residents";
export type { ResidentAccount, ResidentRole } from "@/lib/residents";

type AuthUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
};

const PROFILE_FIELDS =
  "id, full_name, role, email, phone, jurisdiction_id, area, address, created_at";

function isSuspended(user: AuthUser | undefined) {
  return Boolean(user?.banned_until && new Date(user.banned_until) > new Date());
}

function merge(profile: Profile, user: AuthUser | undefined): ResidentAccount {
  return {
    ...profile,
    email: profile.email ?? user?.email ?? null,
    email_confirmed_at: user?.email_confirmed_at ?? null,
    last_sign_in_at: user?.last_sign_in_at ?? null,
    banned_until: user?.banned_until ?? null,
    suspended: isSuspended(user),
    has_auth: Boolean(user),
  };
}

/** Every auth user, keyed by id. Pages through the Auth admin API. */
async function listAuthUsers() {
  const supabase = createAdminClient();
  const users = new Map<string, AuthUser>();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });

    if (error) throw new Error(error.message);

    for (const user of data.users) users.set(user.id, user as AuthUser);

    if (data.users.length < 1000) break;
  }

  return users;
}

export type ResidentFilters = {
  q?: string | null;
  role?: string | null;
  status?: "active" | "suspended" | "unconfirmed" | null;
};

export async function listResidents(filters: ResidentFilters = {}): Promise<ResidentAccount[]> {
  await requireSuperadmin();

  const supabase = createAdminClient();

  let query = supabase.from("profiles").select(PROFILE_FIELDS).order("created_at", { ascending: false }).limit(1000);

  if (filters.role && (RESIDENT_ROLES as readonly string[]).includes(filters.role)) {
    query = query.eq("role", filters.role);
  }

  const q = filters.q?.trim();
  if (q) {
    const term = `%${q.replace(/[%_]/g, "")}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
  }

  const [{ data, error }, users] = await Promise.all([query, listAuthUsers()]);

  if (error) throw new Error(error.message);

  const accounts = ((data ?? []) as Profile[]).map((profile) => merge(profile, users.get(profile.id)));

  switch (filters.status) {
    case "suspended":
      return accounts.filter((account) => account.suspended);
    case "unconfirmed":
      return accounts.filter((account) => account.has_auth && !account.email_confirmed_at);
    case "active":
      return accounts.filter((account) => !account.suspended && account.email_confirmed_at);
    default:
      return accounts;
  }
}

export type ResidentActivity = {
  requests: {
    id: string;
    reference_no: string | null;
    subject: string;
    status: string | null;
    created_at: string;
    is_public?: boolean;
  }[];
  rsvps: number;
  supports: number;
  notifications: number;
  offices: { office_id: string; role: string | null }[];
  organizations: { organization_id: string; role: string | null }[];
};

export async function getResident(id: string): Promise<{ account: ResidentAccount; activity: ResidentActivity } | null> {
  await requireSuperadmin();

  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const supabase = createAdminClient();

  const [{ data: profile }, { data: userData }] = await Promise.all([
    supabase.from("profiles").select(PROFILE_FIELDS).eq("id", id).maybeSingle(),
    supabase.auth.admin.getUserById(id),
  ]);

  if (!profile) return null;

  const [requests, rsvps, supports, notifications, offices, organizations] = await Promise.all([
    supabase
      .from("requests")
      .select("id, reference_no, subject, status, created_at")
      .eq("resident_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("event_rsvps").select("event_id", { count: "exact", head: true }).eq("resident_id", id),
    supabase.from("request_supports").select("request_id", { count: "exact", head: true }).eq("resident_id", id),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("resident_id", id),
    supabase.from("office_members").select("office_id, role").eq("user_id", id),
    supabase.from("organization_members").select("organization_id, role").eq("user_id", id),
  ]);

  return {
    account: merge(profile as Profile, (userData?.user as AuthUser | null) ?? undefined),
    activity: {
      requests: (requests.data ?? []) as ResidentActivity["requests"],
      rsvps: rsvps.count ?? 0,
      supports: supports.error ? 0 : supports.count ?? 0,
      notifications: notifications.count ?? 0,
      offices: (offices.data ?? []) as ResidentActivity["offices"],
      organizations: (organizations.data ?? []) as ResidentActivity["organizations"],
    },
  };
}
