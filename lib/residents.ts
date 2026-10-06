import type { Profile } from "@/lib/types";

/* Client-safe constants and types for resident accounts. */

export const RESIDENT_ROLES = [
  "resident",
  "staff",
  "office_admin",
  "org_admin",
  "admin",
  "superadmin",
] as const;

export type ResidentRole = (typeof RESIDENT_ROLES)[number];

/** Roles an `admin` (not `superadmin`) may assign. */
export const LIMITED_ROLES: readonly ResidentRole[] = ["resident", "staff", "office_admin", "org_admin"];

export type ResidentAccount = Profile & {
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  banned_until: string | null;
  /** True while the account is suspended (banned in Supabase Auth). */
  suspended: boolean;
  /** False when the profile exists without a matching auth user. */
  has_auth: boolean;
};
