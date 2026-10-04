import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type {
  AdminRequest,
  ContentLeader,
  ContentType,
  Event,
  JurisdictionRecord,
  Leader,
  Notification,
  Office,
  OfficeMember,
  Organization,
  Profile,
  ProgrammeApplication,
  RequestUpdate,
  ResidentRequest,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/** Roles that may open the platform administration console. */
export const SUPERADMIN_ROLES = ["admin", "superadmin"] as const;

/** Roles that may work inside an office. */
export const STAFF_ROLES = [
  "staff",
  "admin",
  "superadmin",
] as const;

export const OPEN_REQUEST_STATUSES = [
  "submitted",
  "under_review",
  "in_progress",
] as const;

export const REQUEST_STATUSES = [
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
  "closed",
] as const;

export const JURISDICTION_TYPES = [
  "state",
  "senatorial_district",
  "federal_constituency",
  "state_constituency",
  "lga",
  "lcda",
  "ward",
  "community",
] as const;

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
] as const;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type PlatformStats = Record<
  (typeof COUNTED_TABLES)[number],
  number
>;

export type AdminContentItem = {
  type: ContentType;
  id: string;
  title: string;
};

export type AdminLeader = Leader & {
  organization_id: string | null;
};

export type RequestAccess =
  | "resident"
  | "office"
  | "admin";

export type RequestAccessResult = {
  request: AdminRequest;
  profile: Profile;
  access: RequestAccess;
  membership?: OfficeMember;
};

/* ------------------------------------------------------------------ */
/* Database field selections                                          */
/* ------------------------------------------------------------------ */

const PROFILE_FIELDS =
  "id, full_name, role, email, phone, home_jurisdiction_id, created_at";

const ORGANIZATION_FIELDS =
  "id, name, slug, description, logo_url, primary_color, secondary_color, whatsapp_number, email, phone, website, is_active, created_at";

const REQUEST_FIELDS =
  "id, reference_no, category, subject, description, status, created_at, updated_at";

const ADMIN_REQUEST_FIELDS = `
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
  updated_at,
  routed_at
`;

const COUNTED_TABLES = [
  "organizations",
  "jurisdictions",
  "offices",
  "profiles",
  "programmes",
  "opportunities",
  "projects",
  "events",
  "requests",
] as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function assertOk(
  error: { message: string } | null,
) {
  if (error) {
    throw new Error(error.message);
  }
}

function isSuperadminRole(
  role: string | null | undefined,
): role is (typeof SUPERADMIN_ROLES)[number] {
  return SUPERADMIN_ROLES.includes(
    role as (typeof SUPERADMIN_ROLES)[number],
  );
}

function isStaffRole(
  role: string | null | undefined,
): role is (typeof STAFF_ROLES)[number] {
  return STAFF_ROLES.includes(
    role as (typeof STAFF_ROLES)[number],
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Authentication                                                     */
/* ------------------------------------------------------------------ */

/**
 * Require an authenticated user.
 *
 * getClaims() verifies the access token.
 * getUser() retrieves the current Auth user.
 *
 * We intentionally do not use getSession() as the authorization
 * mechanism.
 */
export async function requireUser(
  next = "/dashboard",
) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (
    claimsError ||
    !claimsData?.claims?.sub
  ) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  const userId = claimsData.claims.sub;

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !userData.user ||
    userData.user.id !== userId
  ) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  return userData.user;
}

/* ------------------------------------------------------------------ */
/* Platform administration guards                                     */
/* ------------------------------------------------------------------ */

export const getSuperadminAccess = cache(
  async () => {
    const supabase = await createClient();

    /*
     * Step 1:
     * Verify the authenticated JWT.
     *
     * getClaims() is the primary authentication check.
     */
    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    if (
      claimsError ||
      !claimsData?.claims?.sub
    ) {
      console.error(
        "[REACH][auth] getClaims failed",
        {
          message:
            claimsError?.message ??
            "No authenticated claims",
          code:
            claimsError?.code ?? null,
        },
      );

      return {
        user: null,
        profile: null,
        allowed: false,
      };
    }

    const userId = claimsData.claims.sub;

    /*
     * Step 2:
     * Get the current authenticated Auth user.
     *
     * This confirms that the user still exists in
     * Supabase Auth and matches the verified JWT subject.
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
      console.error(
        "[REACH][auth] getUser failed",
        {
          claimsUserId: userId,
          userId:
            userData.user?.id ?? null,
          message:
            userError?.message ??
            "No authenticated user",
          code:
            userError?.code ?? null,
        },
      );

      return {
        user: null,
        profile: null,
        allowed: false,
      };
    }

    const user = userData.user;

    /*
     * Step 3:
     * Read the profile through the normal authenticated
     * Supabase client first.
     */
    let profile = await getProfile(user.id);

    /*
     * Production fallback:
     *
     * If the authenticated profile lookup is blocked by
     * profiles RLS, use the server-only admin client.
     *
     * IMPORTANT:
     * This is only reached AFTER getClaims() and getUser()
     * have verified the authenticated identity.
     *
     * The service-role client never reaches the browser.
     */
    if (!profile) {
      try {
        const { createAdminClient } =
          await import(
            "@/lib/supabase/admin-client"
          );

        const admin =
          createAdminClient();

        const {
          data: adminProfile,
          error: adminProfileError,
        } = await admin
          .from("profiles")
          .select(PROFILE_FIELDS)
          .eq("id", user.id)
          .maybeSingle();

        if (adminProfileError) {
          console.error(
            "[REACH][auth] Admin profile lookup failed",
            {
              userId: user.id,
              code:
                adminProfileError.code,
              message:
                adminProfileError.message,
            },
          );
        } else {
          profile =
            (adminProfile as Profile | null) ??
            null;
        }
      } catch (error) {
        console.error(
          "[REACH][auth] Admin profile fallback failed",
          {
            userId: user.id,
            message:
              error instanceof Error
                ? error.message
                : "Unknown error",
          },
        );
      }
    }

    /*
     * Step 4:
     * No profile means no administrative access.
     */
    if (!profile) {
      console.error(
        "[REACH][auth] Profile not found",
        {
          userId: user.id,
          email: user.email ?? null,
        },
      );

      return {
        user,
        profile: null,
        allowed: false,
      };
    }

    /*
     * Step 5:
     * Authorization is still based ONLY on the database
     * profile role.
     */
    const allowed =
      isSuperadminRole(profile.role);

    if (!allowed) {
      console.warn(
        "[REACH][auth] Superadmin access denied",
        {
          userId: user.id,
          email: user.email ?? null,
          role: profile.role,
        },
      );
    }

    return {
      user,
      profile,
      allowed,
    };
  },
);

/**
 * Require a platform administrator.
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
    redirect(
      "/dashboard?denied=superadmin",
    );
  }

  return access;
}

/* ------------------------------------------------------------------ */
/* Staff guard                                                        */
/* ------------------------------------------------------------------ */

/**
 * Require an authenticated staff member.
 *
 * Allowed:
 * - staff
 * - admin
 * - superadmin
 */
export async function requireStaff(
  next = "/office",
) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (
    claimsError ||
    !claimsData?.claims?.sub
  ) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  const userId = claimsData.claims.sub;

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !userData.user ||
    userData.user.id !== userId
  ) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  const profile = await getProfile(userId);

  if (!profile) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  if (!isStaffRole(profile.role)) {
    redirect(
      "/dashboard?denied=staff",
    );
  }

  return {
    user: userData.user,
    profile,
  };
}

/* ------------------------------------------------------------------ */
/* Office authorization                                               */
/* ------------------------------------------------------------------ */

/**
 * Require access to a particular office.
 *
 * Platform administrators have access to all offices.
 * Normal staff must have an office_members record.
 */
export async function requireOfficeAccess(
  officeId: string,
  next = `/office/${officeId}`,
) {
  const access = await requireStaff(next);

  if (
    isSuperadminRole(
      access.profile.role,
    )
  ) {
    return access;
  }

  const supabase = await createClient();

  const {
    data: membership,
    error,
  } = await supabase
    .from("office_members")
    .select(
      "office_id, user_id, role, created_at",
    )
    .eq("office_id", officeId)
    .eq("user_id", access.user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "[REACH][office-access]",
      {
        userId: access.user.id,
        officeId,
        message: error.message,
        code: error.code,
      },
    );
  }

  if (error || !membership) {
    redirect(
      "/dashboard?denied=office",
    );
  }

  return {
    ...access,
    membership: membership as OfficeMember,
  };
}

/* ------------------------------------------------------------------ */
/* Request authorization                                              */
/* ------------------------------------------------------------------ */

/**
 * Require access to a particular request.
 *
 * Access rules:
 *
 * Resident:
 *   Can access their own request.
 *
 * Office staff:
 *   Can access requests assigned to their office.
 *
 * Admin/superadmin:
 *   Can access all requests.
 */
export async function requireRequestAccess(
  requestId: string,
  next = `/dashboard/requests/${requestId}`,
): Promise<RequestAccessResult | null> {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (
    claimsError ||
    !claimsData?.claims?.sub
  ) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  const userId = claimsData.claims.sub;

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !userData.user ||
    userData.user.id !== userId
  ) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  const profile = await getProfile(userId);

  if (!profile) {
    redirect(
      `/login?next=${encodeURIComponent(next)}`,
    );
  }

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("requests")
    .select(ADMIN_REQUEST_FIELDS)
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) {
    console.error(
      "[REACH][request-access]",
      {
        requestId,
        userId,
        message: requestError.message,
        code: requestError.code,
      },
    );

    return null;
  }

  if (!request) {
    return null;
  }

  const adminRequest =
    request as AdminRequest;

  /* Platform administrator */
  if (isSuperadminRole(profile.role)) {
    return {
      request: adminRequest,
      profile,
      access: "admin",
    };
  }

  /* Request owner */
  if (
    adminRequest.resident_id === userId
  ) {
    return {
      request: adminRequest,
      profile,
      access: "resident",
    };
  }

  /* Assigned office staff */
  if (
    adminRequest.assigned_office_id
  ) {
    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("office_members")
      .select(
        "office_id, user_id, role, created_at",
      )
      .eq(
        "office_id",
        adminRequest.assigned_office_id,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "[REACH][request-access-membership]",
        {
          requestId,
          userId,
          message:
            membershipError.message,
          code: membershipError.code,
        },
      );
    }

    if (membership) {
      return {
        request: adminRequest,
        profile,
        access: "office",
        membership:
          membership as OfficeMember,
      };
    }
  }

  redirect(
    "/dashboard?denied=request",
  );
}

/* ------------------------------------------------------------------ */
/* Resident dashboard                                                 */
/* ------------------------------------------------------------------ */

export async function getResidentDashboard(
  userId: string,
) {
  const supabase = await createClient();

  const [
    profile,
    requests,
    applications,
    notifications,
    rsvps,
  ] = await Promise.all([
    getProfile(userId),

    supabase
      .from("requests")
      .select(REQUEST_FIELDS)
      .eq("resident_id", userId)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("programme_applications")
      .select(
        "id, programme_id, status, notes, created_at",
      )
      .eq("resident_id", userId)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("notifications")
      .select(
        "id, title, message, created_at, sent_at",
      )
      .eq("resident_id", userId)
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    supabase
      .from("event_rsvps")
      .select("event_id")
      .eq("resident_id", userId),
  ]);

  assertOk(requests.error);

  /* -------------------------------------------------------------- */
  /* Events                                                          */
  /* -------------------------------------------------------------- */

  let events: Event[] = [];

  const eventIds = (
    rsvps.data ?? []
  ).map(
    (row: { event_id: string }) =>
      row.event_id,
  );

  if (eventIds.length > 0) {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        title,
        slug,
        summary,
        description,
        category,
        venue,
        location,
        starts_at,
        ends_at,
        registration_url,
        capacity,
        status,
        image_url,
        is_featured
        `,
      )
      .in("id", eventIds)
      .order("starts_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "[REACH][resident-events]",
        {
          userId,
          message: error.message,
          code: error.code,
        },
      );
    }

    events = (data ?? []) as Event[];
  }

  /* -------------------------------------------------------------- */
  /* Programme applications                                           */
  /* -------------------------------------------------------------- */

  const applicationRows =
    (applications.data ??
      []) as ProgrammeApplication[];

  const programmeIds = [
    ...new Set(
      applicationRows.map(
        (row) => row.programme_id,
      ),
    ),
  ];

  let programmeTitles = new Map<
    string,
    {
      title: string;
      slug: string;
    }
  >();

  if (programmeIds.length > 0) {
    const { data, error } = await supabase
      .from("programmes")
      .select(
        "id, title, slug",
      )
      .in("id", programmeIds);

    if (error) {
      console.error(
        "[REACH][resident-programmes]",
        {
          userId,
          message: error.message,
          code: error.code,
        },
      );
    }

    programmeTitles = new Map(
      (
        (data ?? []) as {
          id: string;
          title: string;
          slug: string;
        }[]
      ).map((row) => [
        row.id,
        {
          title: row.title,
          slug: row.slug,
        },
      ]),
    );
  }

  return {
    profile,

    requests:
      (requests.data ??
        []) as ResidentRequest[],

    applications:
      applicationRows.map((row) => ({
        ...row,
        programme:
          programmeTitles.get(
            row.programme_id,
          ) ?? null,
      })),

    /*
     * Notifications remain optional.
     * An RLS denial should not break the
     * resident dashboard.
     */
    notifications:
      (notifications.data ??
        []) as Notification[],

    events,
  };
}

/* ------------------------------------------------------------------ */
/* Resident request                                                   */
/* ------------------------------------------------------------------ */

/**
 * A single request owned by the resident,
 * with its update timeline.
 */
export async function getResidentRequest(
  userId: string,
  id: string,
) {
  const supabase = await createClient();

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("requests")
    .select(REQUEST_FIELDS)
    .eq("id", id)
    .eq("resident_id", userId)
    .maybeSingle();

  if (
    requestError ||
    !request
  ) {
    return null;
  }

  const {
    data: updates,
    error: updatesError,
  } = await supabase
    .from("request_updates")
    .select(
      "id, request_id, status, message, author_id, created_at",
    )
    .eq("request_id", id)
    .order("created_at", {
      ascending: true,
    });

  return {
    request:
      request as ResidentRequest,

    updates: updatesError
      ? []
      : ((updates ?? []) as RequestUpdate[]),
  };
}

/* ------------------------------------------------------------------ */
/* Platform statistics                                                */
/* ------------------------------------------------------------------ */

export async function getPlatformStats(): Promise<PlatformStats> {
  await requireSuperadmin();

  const supabase = await createClient();

  const counts = await Promise.all(
    COUNTED_TABLES.map(
      async (table) => {
        const {
          count,
          error,
        } = await supabase
          .from(table)
          .select("id", {
            count: "exact",
            head: true,
          });

        if (error) {
          console.error(
            "[REACH][platform-stats]",
            {
              table,
              message: error.message,
              code: error.code,
            },
          );
        }

        return [
          table,
          count ?? 0,
        ] as const;
      },
    ),
  );

  return Object.fromEntries(
    counts,
  ) as PlatformStats;
}

/* ------------------------------------------------------------------ */
/* Organizations                                                      */
/* ------------------------------------------------------------------ */

export async function getOrganizations() {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("organizations")
    .select(ORGANIZATION_FIELDS)
    .order("name");

  assertOk(error);

  return (data ??
    []) as Organization[];
}

export async function getOrganization(
  id: string,
) {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("organizations")
    .select(ORGANIZATION_FIELDS)
    .eq("id", id)
    .maybeSingle();

  assertOk(error);

  return (
    (data as Organization | null) ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Jurisdictions                                                      */
/* ------------------------------------------------------------------ */

export async function getJurisdictions() {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("jurisdictions")
    .select(
      `
      id,
      name,
      slug,
      type,
      state,
      lga,
      lcda,
      ward,
      parent_id
      `,
    )
    .order("name");

  assertOk(error);

  return (data ??
    []) as JurisdictionRecord[];
}

/* ------------------------------------------------------------------ */
/* Offices                                                            */
/* ------------------------------------------------------------------ */

export async function getOffices() {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("offices")
    .select(
      `
      id,
      name,
      type,
      organization_id,
      jurisdiction_id,
      is_active,
      description,
      created_at
      `,
    )
    .order("name");

  assertOk(error);

  return (data ?? []) as Office[];
}

/* ------------------------------------------------------------------ */
/* Office members                                                     */
/* ------------------------------------------------------------------ */

export async function getOfficeMembers() {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("office_members")
    .select(
      `
      office_id,
      user_id,
      role,
      created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  assertOk(error);

  return (data ??
    []) as OfficeMember[];
}

/* ------------------------------------------------------------------ */
/* Organization members                                               */
/* ------------------------------------------------------------------ */

export async function getOrganizationMembers() {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("organization_members")
    .select(
      `
      organization_id,
      user_id,
      role,
      created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  assertOk(error);

  return data ?? [];
}

/* ------------------------------------------------------------------ */
/* Service routes                                                     */
/* ------------------------------------------------------------------ */

export async function getServiceRoutes() {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("service_routes")
    .select(
      `
      id,
      organization_id,
      jurisdiction_id,
      category,
      office_id,
      priority,
      is_active,
      created_at,
      updated_at
      `,
    )
    .order("priority")
    .order("created_at");

  assertOk(error);

  return data ?? [];
}

/* ------------------------------------------------------------------ */
/* Profiles                                                           */
/* ------------------------------------------------------------------ */

export async function getProfilesByIds(
  ids: string[],
) {
  if (ids.length === 0) {
    return new Map<string, Profile>();
  }

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .in("id", ids);

  assertOk(error);

  return new Map(
    ((data ?? []) as Profile[]).map(
      (row) => [
        row.id,
        row,
      ],
    ),
  );
}

export async function getProfileByEmail(
  email: string,
) {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .ilike("email", email)
    .maybeSingle();

  assertOk(error);

  return (
    (data as Profile | null) ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* All requests                                                       */
/* ------------------------------------------------------------------ */

/**
 * Platform administrators only.
 */
export async function getAllRequests(
  limit = 100,
) {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("requests")
    .select(ADMIN_REQUEST_FIELDS)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  assertOk(error);

  return (data ??
    []) as AdminRequest[];
}

/* ------------------------------------------------------------------ */
/* Organization content counts                                        */
/* ------------------------------------------------------------------ */

export async function getContentCounts(
  organizationId: string,
) {
  await requireSuperadmin();

  const supabase = await createClient();

  const tables = [
    "programmes",
    "opportunities",
    "projects",
    "requests",
  ] as const;

  const counts = await Promise.all(
    tables.map(
      async (table) => {
        const {
          count,
          error,
        } = await supabase
          .from(table)
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq(
            "organization_id",
            organizationId,
          );

        if (error) {
          console.error(
            "[REACH][content-count]",
            {
              table,
              organizationId,
              message: error.message,
              code: error.code,
            },
          );
        }

        return [
          table,
          count ?? 0,
        ] as const;
      },
    ),
  );

  return Object.fromEntries(
    counts,
  ) as Record<
    (typeof tables)[number],
    number
  >;
}

/* ------------------------------------------------------------------ */
/* Leaders                                                            */
/* ------------------------------------------------------------------ */

/**
 * All leadership profiles in the database,
 * including inactive/hidden profiles.
 *
 * IMPORTANT:
 * The database now stores `jurisdiction_id`.
 * The old `jurisdiction` column must NOT be queried.
 *
 * The public application type still exposes
 * `jurisdiction: string | null`, so we resolve
 * the jurisdiction name before returning the result.
 */
export async function getAdminLeaders(): Promise<
  AdminLeader[]
> {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("leaders")
    .select(
      `
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
      `,
    )
    .order("sort_order")
    .order("name");

  if (error) {
    console.error(
      "[REACH][getAdminLeaders]",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
    );

    throw new Error(
      `Unable to load leaders: ${error.message}`,
    );
  }

  const rows =
    (data ?? []) as Array<{
      id: string;
      organization_id: string | null;
      jurisdiction_id: string | null;
      slug: string;
      name: string;
      role: string;
      level:
        | "federal"
        | "state"
        | "local"
        | null;
      level_label: string | null;
      office: string | null;
      constituency: string | null;
      summary: string | null;
      biography: string[];
      service: string[];
      sources: Array<{
        label: string;
        url: string;
      }>;
      image_url: string | null;
      is_active?: boolean;
      sort_order?: number;
    }>;

  const jurisdictionIds = [
    ...new Set(
      rows
        .map(
          (row) =>
            row.jurisdiction_id,
        )
        .filter(
          (
            id,
          ): id is string =>
            Boolean(id),
        ),
    ),
  ];

  const jurisdictionMap =
    new Map<string, string>();

  if (jurisdictionIds.length > 0) {
    const {
      data: jurisdictions,
      error:
        jurisdictionError,
    } = await supabase
      .from("jurisdictions")
      .select("id, name")
      .in(
        "id",
        jurisdictionIds,
      );

    if (jurisdictionError) {
      console.error(
        "[REACH][getAdminLeaders][jurisdictions]",
        {
          message:
            jurisdictionError.message,
          code:
            jurisdictionError.code,
        },
      );
    } else {
      for (
        const jurisdiction of
          jurisdictions ?? []
      ) {
        jurisdictionMap.set(
          jurisdiction.id,
          jurisdiction.name,
        );
      }
    }
  }

  return rows.map((row) => ({
    id: row.id,
    organization_id:
      row.organization_id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    level: row.level,
    level_label:
      row.level_label,
    office: row.office,
    jurisdiction:
      row.jurisdiction_id
        ? jurisdictionMap.get(
            row.jurisdiction_id,
          ) ?? null
        : null,
    constituency:
      row.constituency,
    summary: row.summary,
    biography:
      row.biography ?? [],
    service:
      row.service ?? [],
    sources:
      row.sources ?? [],
    image_url:
      row.image_url,
    is_active:
      row.is_active,
    sort_order:
      row.sort_order,
  }));
}

/* ------------------------------------------------------------------ */
/* Content / leader relationships                                     */
/* ------------------------------------------------------------------ */

export async function getContentLinks(): Promise<
  ContentLeader[]
> {
  await requireSuperadmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("content_leaders")
    .select(
      `
      content_type,
      content_id,
      leader_id,
      role
      `,
    )
    .order("content_type");

  if (error) {
    console.error(
      "[REACH][getContentLinks]",
      {
        message: error.message,
        code: error.code,
      },
    );

    return [];
  }

  return (data ??
    []) as ContentLeader[];
}

/* ------------------------------------------------------------------ */
/* Admin content                                                      */
/* ------------------------------------------------------------------ */

/**
 * Every programme, opportunity,
 * project and event that can be credited.
 */
export async function getAdminContent(): Promise<
  AdminContentItem[]
> {
  await requireSuperadmin();

  const supabase = await createClient();

  const tables: {
    type: ContentType;
    table:
      | "programmes"
      | "opportunities"
      | "projects"
      | "events";
  }[] = [
    {
      type: "programme",
      table: "programmes",
    },
    {
      type: "opportunity",
      table: "opportunities",
    },
    {
      type: "project",
      table: "projects",
    },
    {
      type: "event",
      table: "events",
    },
  ];

  const results = await Promise.all(
    tables.map(
      async ({
        type,
        table,
      }) => {
        const {
          data,
          error,
        } = await supabase
          .from(table)
          .select(
            "id, title",
          )
          .order("title");

        if (error) {
          console.error(
            "[REACH][getAdminContent]",
            {
              table,
              message:
                error.message,
              code:
                error.code,
            },
          );

          return [];
        }

        return (
          (data ?? []) as {
            id: string;
            title: string;
          }[]
        ).map((row) => ({
          type,
          id: row.id,
          title: row.title,
        }));
      },
    ),
  );

  return results.flat();
}

/* ------------------------------------------------------------------ */
/* Current admin profile                                              */
/* ------------------------------------------------------------------ */

export async function getCurrentAdminProfile() {
  const access =
    await getSuperadminAccess();

  return access.profile;
}