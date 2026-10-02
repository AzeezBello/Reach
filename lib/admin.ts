import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const SUPERADMIN_ROLES = ["admin", "superadmin"] as const;

export type SuperadminRole = (typeof SUPERADMIN_ROLES)[number];

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  organization_id?: string | null;
  office_id?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

export type AdminRequest = {
  id: string;
  reference_no: string;
  resident_id: string;
  organization_id: string;
  jurisdiction_id: string | null;
  assigned_office_id: string | null;
  subject: string;
  description: string;
  category: string | null;
  status: string;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
};

const PROFILE_FIELDS = `
  id,
  email,
  full_name,
  role,
  organization_id,
  office_id,
  phone,
  avatar_url
`;

const LEADER_FIELDS = `
  id,
  organization_id,
  jurisdiction_id,
  slug,
  name,
  role,
  level,
  level_label,
  office,
  constituency,
  summary,
  biography,
  service,
  sources,
  image_url,
  is_active,
  sort_order
`;

function isSuperadminRole(
  role: string | null | undefined,
): role is SuperadminRole {
  return (
    role === "admin" ||
    role === "superadmin"
  );
}

/**
 * Get a profile by authenticated user ID.
 *
 * Errors are deliberately returned to the caller instead of being
 * silently converted into a null profile. This makes auth/RLS problems
 * diagnosable in production.
 */
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[REACH][getProfile]", {
      userId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    return null;
  }

  return (data as Profile | null) ?? null;
});

/**
 * Get the currently authenticated user and their profile.
 *
 * Authentication flow:
 * 1. Verify JWT claims.
 * 2. Get the current Auth user.
 * 3. Ensure the IDs agree.
 * 4. Load the matching application profile.
 * 5. Check the application role.
 */
export async function getSuperadminAccess() {
  const supabase = await createClient();

  /*
   * Step 1: Verify the JWT.
   *
   * Do not use getSession() as the authorization check.
   * Supabase recommends getClaims() for protecting server pages/data.
   */
  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    console.error("[REACH][auth] getClaims failed", {
      message: claimsError?.message ?? "No authenticated claims",
      code: claimsError?.code ?? null,
    });

    return {
      user: null,
      profile: null,
      allowed: false,
    };
  }

  const userId = claimsData.claims.sub;

  /*
   * Step 2: Get the current Auth user.
   *
   * This confirms the user against Supabase Auth rather than relying
   * solely on data embedded in the request cookie.
   */
  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !userData.user ||
    userData.user.id !== userId
  ) {
    console.error("[REACH][auth] getUser failed", {
      claimsUserId: userId,
      userId: userData.user?.id ?? null,
      message: userError?.message ?? "No authenticated user",
      code: userError?.code ?? null,
    });

    return {
      user: null,
      profile: null,
      allowed: false,
    };
  }

  const user = userData.user;

  /*
   * Step 3: Load the application profile.
   */
  const profile = await getProfile(user.id);

  if (!profile) {
    console.error("[REACH][auth] Profile not found", {
      userId: user.id,
      email: user.email ?? null,
    });

    return {
      user,
      profile: null,
      allowed: false,
    };
  }

  /*
   * Step 4: Check the application-level role.
   */
  const allowed = isSuperadminRole(profile.role);

  if (!allowed) {
    console.warn("[REACH][auth] Superadmin access denied", {
      userId: user.id,
      email: user.email ?? null,
      role: profile.role,
    });
  }

  return {
    user,
    profile,
    allowed,
  };
}

/**
 * Require admin/superadmin access.
 *
 * Redirects unauthenticated users to login and authenticated users
 * without the required role back to the dashboard.
 */
export async function requireSuperadmin(
  next = "/superadmin",
) {
  const access = await getSuperadminAccess();

  if (!access.user) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  if (!access.allowed) {
    redirect("/dashboard?denied=superadmin");
  }

  return access;
}

/**
 * Require any authenticated user.
 */
export async function requireUser(
  next = "/dashboard",
) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  return {
    user: userData.user,
    profile: await getProfile(userData.user.id),
  };
}

/**
 * Require staff-level access.
 */
export async function requireStaff(
  next = "/office",
) {
  const access = await requireUser(next);

  const role = access.profile?.role;

  const allowed =
    role === "staff" ||
    role === "admin" ||
    role === "superadmin" ||
    role === "org_admin" ||
    role === "office_admin";

  if (!allowed) {
    redirect("/dashboard?denied=staff");
  }

  return access;
}

/**
 * Require access to a specific office.
 */
export async function requireOfficeAccess(
  officeId: string,
  next = "/office",
) {
  const access = await requireStaff(next);

  const role = access.profile?.role;

  /*
   * Global administrators can access every office.
   */
  if (
    role === "admin" ||
    role === "superadmin"
  ) {
    return access;
  }

  const supabase = await createClient();

  const { data: membership, error } = await supabase
    .from("office_members")
    .select("office_id, user_id")
    .eq("office_id", officeId)
    .eq("user_id", access.user.id)
    .maybeSingle();

  if (error) {
    console.error("[REACH][office-access]", {
      userId: access.user.id,
      officeId,
      message: error.message,
      code: error.code,
    });
  }

  if (!membership) {
    redirect("/dashboard?denied=office");
  }

  return access;
}

/**
 * Require access to a specific request.
 */
export async function requireRequestAccess(
  requestId: string,
  next = "/dashboard",
) {
  const access = await requireUser(next);

  const role = access.profile?.role;

  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("requests")
    .select(`
      id,
      reference_no,
      resident_id,
      organization_id,
      jurisdiction_id,
      assigned_office_id,
      subject,
      description,
      category,
      status,
      staff_notes,
      created_at,
      updated_at
    `)
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    console.error("[REACH][request-access]", {
      requestId,
      userId: access.user.id,
      message: error.message,
      code: error.code,
    });

    redirect("/dashboard?error=request");
  }

  if (!request) {
    redirect("/dashboard?error=not-found");
  }

  /*
   * Global administrators can access every request.
   */
  if (
    role === "admin" ||
    role === "superadmin"
  ) {
    return {
      ...access,
      request: request as AdminRequest,
    };
  }

  /*
   * Residents can access their own requests.
   */
  if (request.resident_id === access.user.id) {
    return {
      ...access,
      request: request as AdminRequest,
    };
  }

  /*
   * Staff/office administrators can access requests assigned
   * to an office where they are a member.
   */
  if (
    request.assigned_office_id &&
    (
      role === "staff" ||
      role === "org_admin" ||
      role === "office_admin"
    )
  ) {
    const { data: membership } = await supabase
      .from("office_members")
      .select("office_id, user_id")
      .eq(
        "office_id",
        request.assigned_office_id,
      )
      .eq("user_id", access.user.id)
      .maybeSingle();

    if (membership) {
      return {
        ...access,
        request: request as AdminRequest,
      };
    }
  }

  redirect("/dashboard?denied=request");
}

/**
 * Get all leaders for administration.
 *
 * Important:
 * The leaders table uses jurisdiction_id.
 * Do not query the removed/stale `jurisdiction` column.
 */
export async function getAdminLeaders() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leaders")
    .select(LEADER_FIELDS)
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("[REACH][getAdminLeaders]", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(
      `Unable to load leaders: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * Get all organizations for administration.
 */
export async function getAdminOrganizations() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "[REACH][getAdminOrganizations]",
      error,
    );

    throw new Error(
      `Unable to load organizations: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * Get all jurisdictions for administration.
 */
export async function getAdminJurisdictions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jurisdictions")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "[REACH][getAdminJurisdictions]",
      error,
    );

    throw new Error(
      `Unable to load jurisdictions: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * Get all offices for administration.
 */
export async function getAdminOffices() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "[REACH][getAdminOffices]",
      error,
    );

    throw new Error(
      `Unable to load offices: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * Get organization members.
 */
export async function getAdminMembers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "[REACH][getAdminMembers]",
      error,
    );

    throw new Error(
      `Unable to load members: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * Get leader account provisioning queue.
 */
export async function getLeaderAccountProvisioning() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leader_account_provisioning")
    .select(`
      id,
      leader_id,
      email,
      status,
      created_at,
      updated_at
    `)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "[REACH][getLeaderAccountProvisioning]",
      error,
    );

    throw new Error(
      `Unable to load leader accounts: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * Get service routing records.
 */
export async function getAdminRouting() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("service_routes")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "[REACH][getAdminRouting]",
      error,
    );

    throw new Error(
      `Unable to load routing records: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * Get all requests for administrators.
 */
export async function getAdminRequests() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requests")
    .select(`
      id,
      reference_no,
      resident_id,
      organization_id,
      jurisdiction_id,
      assigned_office_id,
      subject,
      description,
      category,
      status,
      staff_notes,
      created_at,
      updated_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "[REACH][getAdminRequests]",
      error,
    );

    throw new Error(
      `Unable to load requests: ${error.message}`,
    );
  }

  return (data ?? []) as AdminRequest[];
}

/**
 * Get current admin profile.
 */
export async function getCurrentAdminProfile() {
  const access = await getSuperadminAccess();

  return access.profile;
}