"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/components/action-form";
import {
  JURISDICTION_TYPES,
  OFFICE_TYPES,
  REQUEST_STATUSES,
  STAFF_ROLES,
  getProfileByEmail,
  getSuperadminAccess,
} from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { SITE_URL } from "@/lib/config";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

async function guard() {
  const access = await getSuperadminAccess();

  if (!access.user || !access.allowed) {
    throw new Error("You do not have permission to perform this action.");
  }

  return access.user;
}

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function required(formData: FormData, name: string, label: string) {
  const value = text(formData, name);

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

function optional(formData: FormData, name: string) {
  return text(formData, name) || null;
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function oneOf(value: string, allowed: readonly string[], label: string) {
  if (!allowed.includes(value)) {
    throw new Error(`${label} is not a valid choice.`);
  }

  return value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function hexColor(value: string | null) {
  if (!value) return null;

  if (!/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error("Colours must be six-digit hex values, for example #15803d.");
  }

  return value.toLowerCase();
}

async function run(work: () => Promise<string>): Promise<ActionState> {
  try {
    const message = await work();
    return { ok: true, message };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Organizations                                                       */
/* ------------------------------------------------------------------ */

function organizationInput(formData: FormData) {
  const name = required(formData, "name", "Name");

  return {
    name,
    slug: slugify(text(formData, "slug") || name),
    description: optional(formData, "description"),
    logo_url: optional(formData, "logo_url"),
    primary_color: hexColor(optional(formData, "primary_color")),
    secondary_color: hexColor(optional(formData, "secondary_color")),
    whatsapp_number: optional(formData, "whatsapp_number"),
    email: optional(formData, "email"),
    phone: optional(formData, "phone"),
    website: optional(formData, "website"),
    is_active: checked(formData, "is_active"),
  };
}

export async function createOrganization(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const input = organizationInput(formData);
    const supabase = createAdminClient();

    const { error } = await supabase.from("organizations").insert(input);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/organizations");

    return `Created ${input.name}.`;
  });
}

export async function updateOrganization(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const id = required(formData, "id", "Organization");
    const input = organizationInput(formData);
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("organizations")
      .update(input)
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/organizations");
    revalidatePath(`/superadmin/organizations/${id}`);
    revalidatePath("/", "layout");

    return "Organization saved.";
  });
}

export async function setOrganizationActive(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const id = required(formData, "id", "Organization");
    const isActive = text(formData, "is_active") === "true";
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("organizations")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/organizations");

    return isActive ? "Organization activated." : "Organization deactivated.";
  });
}

/* ------------------------------------------------------------------ */
/* Jurisdictions                                                       */
/* ------------------------------------------------------------------ */

export async function createJurisdiction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const name = required(formData, "name", "Name");
    const input = {
      name,
      slug: slugify(text(formData, "slug") || name),
      type: oneOf(required(formData, "type", "Type"), JURISDICTION_TYPES, "Type"),
      state: optional(formData, "state"),
      lga: optional(formData, "lga"),
      lcda: optional(formData, "lcda"),
      ward: optional(formData, "ward"),
      parent_id: optional(formData, "parent_id"),
    };

    const supabase = createAdminClient();
    const { error } = await supabase.from("jurisdictions").insert(input);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/jurisdictions");

    return `Created ${name}.`;
  });
}

/* ------------------------------------------------------------------ */
/* Offices                                                             */
/* ------------------------------------------------------------------ */

export async function createOffice(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const name = required(formData, "name", "Name");
    const input = {
      name,
      type: oneOf(required(formData, "type", "Type"), OFFICE_TYPES, "Type"),
      organization_id: required(formData, "organization_id", "Organization"),
      jurisdiction_id: optional(formData, "jurisdiction_id"),
      description: optional(formData, "description"),
      is_active: checked(formData, "is_active"),
    };

    const supabase = createAdminClient();
    const { error } = await supabase.from("offices").insert(input);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/offices");

    return `Created ${name}.`;
  });
}

export async function setOfficeActive(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const id = required(formData, "id", "Office");
    const isActive = text(formData, "is_active") === "true";
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("offices")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/offices");

    return isActive ? "Office activated." : "Office deactivated.";
  });
}

/* ------------------------------------------------------------------ */
/* Staff                                                               */
/* ------------------------------------------------------------------ */

export async function addOfficeMember(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const officeId = required(formData, "office_id", "Office");
    const email = required(formData, "email", "Email");
    const role = oneOf(required(formData, "role", "Role"), STAFF_ROLES, "Role");

    const profile = await getProfileByEmail(email);

    if (!profile) {
      throw new Error(
        `No resident account was found for ${email}. Ask them to create an account first.`
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("office_members")
      .upsert(
        { office_id: officeId, user_id: profile.id, role },
        { onConflict: "office_id,user_id" }
      );
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/staff");

    return `${profile.full_name || email} added as ${role}.`;
  });
}

export async function removeOfficeMember(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const officeId = required(formData, "office_id", "Office");
    const userId = required(formData, "user_id", "User");

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("office_members")
      .delete()
      .eq("office_id", officeId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/staff");

    return "Staff member removed.";
  });
}

/* ------------------------------------------------------------------ */
/* Requests                                                            */
/* ------------------------------------------------------------------ */

export async function updateRequestStatus(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    const user = await guard();

    const id = required(formData, "id", "Request");

    const status = oneOf(
      required(formData, "status", "Status"),
      REQUEST_STATUSES,
      "Status"
    );

    const message = optional(formData, "message");
    const staffNotes = optional(formData, "staff_notes");

    /*
     * Prefer the hardened RPC, which runs as the signed-in admin and writes
     * the status + timeline entry atomically. When the database policies do
     * not yet grant the admin session that access (see the
     * 20261006000000_platform_admin_access migration), fall back to the
     * verified server-side service role and write the same two records.
     */
    const session = await createClient();
    const rpc = await session.rpc("update_request_status", {
      target_request: id,
      next_status: status,
      update_message: message,
    });

    const admin = createAdminClient();

    if (rpc.error || !rpc.data || rpc.data.length === 0) {
      const { data: updated, error: updateError } = await admin
        .from("requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (updateError) throw new Error(updateError.message);
      if (!updated) throw new Error("The request could not be found.");

      const { error: timelineError } = await admin.from("request_updates").insert({
        request_id: id,
        author_id: user.id,
        status,
        message,
      });

      if (timelineError) {
        throw new Error(`Status was updated, but the timeline entry failed: ${timelineError.message}`);
      }
    }

    /* Staff notes are private to the office and live outside the timeline. */
    if (staffNotes !== null) {
      const { error: notesError } = await admin
        .from("requests")
        .update({ staff_notes: staffNotes, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (notesError) {
        throw new Error(`Status was updated, but staff notes could not be saved: ${notesError.message}`);
      }
    }

    revalidatePath("/superadmin/requests");
    revalidatePath(`/requests/${id}`);
    revalidatePath("/requests");

    return `Status set to ${status.replace(/_/g, " ")}.`;
  });
}

/* ------------------------------------------------------------------ */
/* Leaders & collaborations                                           */
/* ------------------------------------------------------------------ */

const CONTENT_TYPES = [
  "programme",
  "opportunity",
  "project",
  "event",
] as const;

const CONTENT_PUBLIC_PATHS: Record<(typeof CONTENT_TYPES)[number], string> = {
  programme: "/programmes",
  opportunity: "/opportunities",
  project: "/projects",
  event: "/events",
};

const LEADERSHIP_LEVELS = [
  "federal",
  "state",
  "local",
] as const;

const COLLABORATION_ROLES = [
  "lead",
  "partner",
] as const;

function lines(formData: FormData, name: string) {
  return text(formData, name)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSources(formData: FormData) {
  return lines(formData, "sources").map((line) => {
    const [label, url] = line
      .split("|")
      .map((part) => part.trim());

    if (
      !label ||
      !url ||
      !/^https?:\/\//.test(url)
    ) {
      throw new Error(
        `Sources must be "Label | https://…" per line. Check: ${line}`
      );
    }

    return {
      label,
      url,
    };
  });
}

function leaderProfileInput(formData: FormData) {
  const name = required(
    formData,
    "name",
    "Full name"
  );

  const sortOrder = Number.parseInt(
    text(formData, "sort_order") || "0",
    10
  );

  return {
    name,

    slug: slugify(
      text(formData, "slug") || name
    ),

    role: required(
      formData,
      "role",
      "Role"
    ),

    level: oneOf(
      required(
        formData,
        "level",
        "Level"
      ),
      LEADERSHIP_LEVELS,
      "Level"
    ),

    level_label: optional(
      formData,
      "level_label"
    ),

    office: optional(
      formData,
      "office"
    ),

    jurisdiction_id: optional(
      formData,
      "jurisdiction_id"
    ),

    constituency: optional(
      formData,
      "constituency"
    ),

    summary: optional(
      formData,
      "summary"
    ),

    biography: lines(
      formData,
      "biography"
    ),

    service: lines(
      formData,
      "service"
    ),

    sources: parseSources(
      formData
    ),

    image_url: optional(
      formData,
      "image_url"
    ),

    is_active: checked(
      formData,
      "is_active"
    ),

    sort_order: Number.isNaN(sortOrder)
      ? 0
      : sortOrder,
  };
}

export async function createLeader(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const organizationId = required(
      formData,
      "organization_id",
      "Organization"
    );

    const input =
      leaderProfileInput(formData);

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("leaders")
      .insert({
        ...input,
        organization_id: organizationId,
      });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/superadmin/leaders"
    );

    revalidatePath(
      "/leadership"
    );

    revalidatePath(
      "/",
      "layout"
    );

    return `Created the profile for ${input.name}.`;
  });
}

export async function updateLeaderProfile(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const id = required(
      formData,
      "id",
      "Leader"
    );

    const organizationId = required(
      formData,
      "organization_id",
      "Organization"
    );

    const input =
      leaderProfileInput(formData);

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("leaders")
      .update({
        ...input,
        organization_id: organizationId,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/superadmin/leaders"
    );

    revalidatePath(
      "/superadmin/leader-accounts"
    );

    revalidatePath(
      "/leadership"
    );

    revalidatePath(
      `/leadership/${input.slug}`
    );

    revalidatePath(
      "/",
      "layout"
    );

    return `Updated the profile for ${input.name}.`;
  });
}

export async function setLeaderActive(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const id = required(
      formData,
      "id",
      "Leader"
    );

    const isActive =
      text(
        formData,
        "is_active"
      ) === "true";

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("leaders")
      .update({
        is_active: isActive,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/superadmin/leaders"
    );

    revalidatePath(
      "/leadership"
    );

    revalidatePath(
      "/",
      "layout"
    );

    return isActive
      ? "Profile is now visible."
      : "Profile is now hidden.";
  });
}

/* ------------------------------------------------------------------ */
/* Leader account management                                          */
/* ------------------------------------------------------------------ */

export async function unlinkLeaderAccount(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const leaderId = required(
      formData,
      "leader_id",
      "Leader"
    );

    const supabase = createAdminClient();

    const {
      error,
    } = await supabase
      .from(
        "leader_account_provisioning"
      )
      .update({
        status: "revoked",
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "leader_id",
        leaderId
      );

    if (error) {
      throw new Error(
        error.message
      );
    }

    revalidatePath(
      "/superadmin/leader-accounts"
    );

    revalidatePath(
      "/superadmin/leaders"
    );

    return "Leader account unlinked.";
  });
}

export async function linkLeaderAccount(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const leaderId = required(
      formData,
      "leader_id",
      "Leader"
    );

    const email = required(
      formData,
      "email",
      "Email"
    ).toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      throw new Error(
        "Enter a valid email address."
      );
    }

    /*
     * profiles has restrictive RLS and users can normally
     * only see their own profile. This lookup therefore uses
     * the trusted server-side admin client.
     */
    const admin =
      createAdminClient();

    const {
      data: profile,
      error: profileError,
    } = await admin
      .from("profiles")
      .select(
        "id, full_name, email"
      )
      .ilike(
        "email",
        email
      )
      .maybeSingle();

    if (profileError) {
      throw new Error(
        profileError.message
      );
    }

    if (!profile) {
      throw new Error(
        "No registered account was found with that email."
      );
    }

    /*
     * The account already exists, so mark the leader
     * provisioning record as active.
     */
    const supabase = createAdminClient();

    const {
      error,
    } = await supabase
      .from(
        "leader_account_provisioning"
      )
      .upsert(
        {
          leader_id: leaderId,
          email,
          status: "active",
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "leader_id",
        }
      );

    if (error) {
      throw new Error(
        error.message
      );
    }

    revalidatePath(
      "/superadmin/leader-accounts"
    );

    revalidatePath(
      "/superadmin/leaders"
    );

    return `${
      profile.full_name || email
    } linked successfully.`;
  });
}

export async function inviteLeaderAccount(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const leaderId = required(
      formData,
      "leader_id",
      "Leader"
    );

    const email = required(
      formData,
      "email",
      "Email"
    ).toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      throw new Error(
        "Enter a valid email address."
      );
    }

    /*
     * Use the admin client for profile lookup because
     * normal authenticated profile SELECT is restricted
     * by RLS to the current user's profile.
     */
    const admin =
      createAdminClient();

    const {
      data: existingProfile,
      error: profileError,
    } = await admin
      .from("profiles")
      .select(
        "id, full_name, email"
      )
      .ilike(
        "email",
        email
      )
      .maybeSingle();

    if (profileError) {
      throw new Error(
        profileError.message
      );
    }

    const supabase = createAdminClient();

    /*
     * Existing REACH account:
     * link it instead of sending another invitation.
     */
    if (existingProfile) {
      const {
        error,
      } = await supabase
        .from(
          "leader_account_provisioning"
        )
        .upsert(
          {
            leader_id: leaderId,
            email,
            status: "active",
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "leader_id",
          }
        );

      if (error) {
        throw new Error(
          error.message
        );
      }

      revalidatePath(
        "/superadmin/leader-accounts"
      );

      revalidatePath(
        "/superadmin/leaders"
      );

      return `${
        existingProfile.full_name ||
        email
      } linked successfully.`;
    }

    /*
     * New account:
     * send the Supabase Auth invitation using
     * the trusted server-side admin client.
     */
    const {
      data: invited,
      error: inviteError,
    } =
      await admin.auth.admin
        .inviteUserByEmail(
          email,
          {
            redirectTo:
              `${SITE_URL}/auth/callback?next=/leader`,
            data: {
              leader_id: leaderId,
            },
          }
        );

    if (inviteError) {
      throw new Error(
        inviteError.message
      );
    }

    if (!invited.user) {
      throw new Error(
        "Supabase did not return the invited user."
      );
    }

    /*
     * Save the provisioning record.
     *
     * The profile is expected to be created by the
     * application's normal profile creation flow.
     */
    const {
      error:
        provisioningError,
    } = await supabase
      .from(
        "leader_account_provisioning"
      )
      .upsert(
        {
          leader_id: leaderId,
          email,
          status: "pending",
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "leader_id",
        }
      );

    if (provisioningError) {
      throw new Error(
        provisioningError.message
      );
    }

    revalidatePath(
      "/superadmin/leader-accounts"
    );

    revalidatePath(
      "/superadmin/leaders"
    );

    return `Invitation sent to ${email}.`;
  });
}

/* ------------------------------------------------------------------ */
/* Content / leader collaborations                                     */
/* ------------------------------------------------------------------ */

export async function linkContentToLeader(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const leaderId = required(
      formData,
      "leader_id",
      "Leader"
    );

    const [
      contentType,
      contentId,
    ] = required(
      formData,
      "content",
      "Content"
    ).split(":");

    const role = oneOf(
      required(
        formData,
        "role",
        "Role"
      ),
      COLLABORATION_ROLES,
      "Role"
    );

    oneOf(
      contentType ?? "",
      CONTENT_TYPES,
      "Content type"
    );

    if (!contentId) {
      throw new Error(
        "Please select an item to link."
      );
    }

    const supabase = createAdminClient();

    const { error } =
      await supabase
        .from(
          "content_leaders"
        )
        .upsert(
          {
            content_type:
              contentType,
            content_id:
              contentId,
            leader_id:
              leaderId,
            role,
          },
          {
            onConflict:
              "content_type,content_id,leader_id",
          }
        );

    if (error) {
      throw new Error(
        error.message
      );
    }

    revalidatePath(
      "/superadmin/leaders"
    );

    revalidatePath(
      "/leadership",
      "layout"
    );

    revalidatePath(
      CONTENT_PUBLIC_PATHS[contentType as (typeof CONTENT_TYPES)[number]],
      "layout"
    );

    return role === "lead"
      ? "Linked as lead."
      : "Linked as collaboration partner.";
  });
}

export async function unlinkContentFromLeader(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const contentType = oneOf(
      required(
        formData,
        "content_type",
        "Content type"
      ),
      CONTENT_TYPES,
      "Content type"
    );

    const contentId = required(
      formData,
      "content_id",
      "Content"
    );

    const leaderId = required(
      formData,
      "leader_id",
      "Leader"
    );

    const supabase = createAdminClient();

    const { error } =
      await supabase
        .from(
          "content_leaders"
        )
        .delete()
        .eq(
          "content_type",
          contentType
        )
        .eq(
          "content_id",
          contentId
        )
        .eq(
          "leader_id",
          leaderId
        );

    if (error) {
      throw new Error(
        error.message
      );
    }

    revalidatePath(
      "/superadmin/leaders"
    );

    revalidatePath(
      "/leadership",
      "layout"
    );

    return "Collaboration removed.";
  });
}


/* ------------------------------------------------------------------ */
/* Organization membership                                             */
/* ------------------------------------------------------------------ */

const MEMBERSHIP_ROLES = [
  "org_admin",
  "staff",
  "admin",
  "superadmin",
] as const;

const OFFICE_MEMBER_ROLES = [
  "staff",
  "admin",
  "office_admin",
] as const;

export async function assignOrganizationRole(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const organizationId = required(
      formData,
      "organization_id",
      "Organization"
    );

    const email = required(
      formData,
      "email",
      "User email"
    );

    const role = oneOf(
      required(formData, "role", "Role"),
      MEMBERSHIP_ROLES,
      "Role"
    );

    const profile = await getProfileByEmail(email);

    if (!profile) {
      throw new Error(
        "No registered user was found with that email."
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("organization_members")
      .upsert(
        {
          organization_id: organizationId,
          user_id: profile.id,
          role,
        },
        {
          onConflict: "organization_id,user_id",
        }
      );

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/superadmin/organizations"
    );

    revalidatePath(
      "/superadmin/members"
    );

    return `${profile.full_name || email} is now ${role}.`;
  });
}


export async function assignOfficeRole(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const officeId = required(
      formData,
      "office_id",
      "Office"
    );

    const email = required(
      formData,
      "email",
      "User email"
    );

    const role = oneOf(
      required(formData, "role", "Role"),
      OFFICE_MEMBER_ROLES,
      "Role"
    );

    const profile = await getProfileByEmail(email);

    if (!profile) {
      throw new Error(
        "No registered user was found with that email."
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("office_members")
      .upsert(
        {
          office_id: officeId,
          user_id: profile.id,
          role,
        },
        {
          onConflict: "office_id,user_id",
        }
      );

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/superadmin/members"
    );

    return `${profile.full_name || email} is now assigned to the office.`;
  });
}


export async function removeOrganizationRole(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const organizationId = required(
      formData,
      "organization_id",
      "Organization"
    );

    const userId = required(
      formData,
      "user_id",
      "User"
    );

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq(
        "organization_id",
        organizationId
      )
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/superadmin/members"
    );

    return "Organization membership removed.";
  });
}





const ROUTING_CATEGORIES = [
  "general",
  "education",
  "employment",
  "health",
  "housing",
  "infrastructure",
  "business",
  "social_support",
  "documentation",
  "community",
];

export async function createServiceRoute(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const organizationId = required(
      formData,
      "organization_id",
      "Organization"
    );

    const officeId = required(
      formData,
      "office_id",
      "Office"
    );

    const jurisdictionId =
      optional(
        formData,
        "jurisdiction_id"
      );

    const categoryValue = optional(formData, "category");
    const category = categoryValue
      ? oneOf(categoryValue, ROUTING_CATEGORIES, "Category")
      : null;

    const priorityValue =
      Number.parseInt(
        text(formData, "priority") || "100",
        10
      );

    const supabase = createAdminClient();

    const { error } =
      await supabase
        .from("service_routes")
        .insert({
          organization_id:
            organizationId,
          jurisdiction_id:
            jurisdictionId,
          category,
          office_id: officeId,
          priority:
            Number.isNaN(priorityValue)
              ? 100
              : priorityValue,
          is_active: checked(
            formData,
            "is_active"
          ),
        });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/superadmin/routing"
    );

    return "Routing rule created.";
  });
}


export async function setServiceRouteActive(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const id = required(
      formData,
      "id",
      "Routing rule"
    );

    const isActive =
      text(formData, "is_active") ===
      "true";

    const supabase = createAdminClient();

    const { error } =
      await supabase
        .from("service_routes")
        .update({
          is_active: isActive,
        })
        .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/superadmin/routing"
    );

    return isActive
      ? "Routing rule activated."
      : "Routing rule disabled.";
  });
}