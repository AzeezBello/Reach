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
    const supabase = await createClient();

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
    const supabase = await createClient();

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
    const supabase = await createClient();

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

    const supabase = await createClient();
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

    const supabase = await createClient();
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
    const supabase = await createClient();

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

    const supabase = await createClient();
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

    const supabase = await createClient();
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
    const status = oneOf(required(formData, "status", "Status"), REQUEST_STATUSES, "Status");
    const message = optional(formData, "message");
    const staffNotes = optional(formData, "staff_notes");

    const supabase = await createClient();

    const { error } = await supabase
      .from("requests")
      .update({
        status,
        ...(staffNotes !== null && { staff_notes: staffNotes }),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    // The public timeline entry is best-effort: the status change already
    // succeeded even if the updates table rejects the insert.
    const { error: updateError } = await supabase.from("request_updates").insert({
      request_id: id,
      status,
      message,
      author_id: user.id,
    });

    revalidatePath("/superadmin/requests");
    revalidatePath(`/requests/${id}`);
    revalidatePath("/requests");

    return updateError
      ? `Status set to ${status.replace(/_/g, " ")}. Timeline entry was not saved: ${updateError.message}`
      : `Status set to ${status.replace(/_/g, " ")}.`;
  });
}

/* ------------------------------------------------------------------ */
/* Leaders & collaborations                                            */
/* ------------------------------------------------------------------ */

const CONTENT_TYPES = ["programme", "opportunity", "project", "event"];
const LEADERSHIP_LEVELS = ["federal", "state", "local"];
const COLLABORATION_ROLES = ["lead", "partner"];

function lines(formData: FormData, name: string) {
  return text(formData, name)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSources(formData: FormData) {
  return lines(formData, "sources").map((line) => {
    const [label, url] = line.split("|").map((part) => part.trim());

    if (!label || !url || !/^https?:\/\//.test(url)) {
      throw new Error(`Sources must be "Label | https://…" per line. Check: ${line}`);
    }

    return { label, url };
  });
}

function leaderProfileInput(formData: FormData) {
  const name = required(formData, "name", "Full name");
  const sortOrder = Number.parseInt(text(formData, "sort_order") || "0", 10);

  return {
    name,
    slug: slugify(text(formData, "slug") || name),
    role: required(formData, "role", "Role"),
    level: oneOf(required(formData, "level", "Level"), LEADERSHIP_LEVELS, "Level"),
    level_label: optional(formData, "level_label"),
    office: optional(formData, "office"),
    jurisdiction: optional(formData, "jurisdiction"),
    constituency: optional(formData, "constituency"),
    summary: optional(formData, "summary"),
    biography: lines(formData, "biography"),
    service: lines(formData, "service"),
    sources: parseSources(formData),
    image_url: optional(formData, "image_url"),
    is_active: checked(formData, "is_active"),
    sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
  };
}

export async function createLeader(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const organizationId = required(formData, "organization_id", "Organization");
    const input = leaderProfileInput(formData);

    const supabase = await createClient();
    const { error } = await supabase
      .from("leaders")
      .insert({ ...input, organization_id: organizationId });
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/leaders");
    revalidatePath("/leadership");
    revalidatePath("/", "layout");

    return `Created the profile for ${input.name}.`;
  });
}

export async function updateLeaderProfile(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const id = required(formData, "id", "Leader");
    const organizationId = required(formData, "organization_id", "Organization");
    const input = leaderProfileInput(formData);
    const supabase = await createClient();
    const { error } = await supabase
      .from("leaders")
      .update({ ...input, organization_id: organizationId })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/leaders");
    revalidatePath("/superadmin/leader-accounts");
    revalidatePath("/leadership");
    revalidatePath(`/leadership/${input.slug}`);
    revalidatePath("/", "layout");

    return `Updated the profile for ${input.name}.`;
  });
}

export async function setLeaderActive(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const id = required(formData, "id", "Leader");
    const isActive = text(formData, "is_active") === "true";
    const supabase = await createClient();

    const { error } = await supabase
      .from("leaders")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/leaders");
    revalidatePath("/leadership");
    revalidatePath("/", "layout");

    return isActive ? "Profile is now visible." : "Profile is now hidden.";
  });
}

export async function linkLeaderAccount(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const leaderId = required(formData, "leader_id", "Leader");
    const email = required(formData, "email", "Email");
    const profile = await getProfileByEmail(email);

    if (!profile) {
      throw new Error("No registered account was found with that email.");
    }

    const supabase = await createClient();
    const { data: leader, error: leaderError } = await supabase
      .from("leaders")
      .select("name, profile_id")
      .eq("id", leaderId)
      .maybeSingle();

    if (leaderError) throw new Error(leaderError.message);
    if (!leader) throw new Error("The selected leadership profile no longer exists.");
    if (leader.profile_id && leader.profile_id !== profile.id) {
      throw new Error("This leader already has an account linked. Unlink it first.");
    }

    const { error } = await supabase
      .from("leaders")
      .update({ profile_id: profile.id })
      .eq("id", leaderId);

    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/leader-accounts");
    revalidatePath("/superadmin/leaders");

    return `${profile.full_name || email} linked to ${leader.name}.`;
  });
}

export async function unlinkLeaderAccount(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const leaderId = required(formData, "leader_id", "Leader");
    const supabase = await createClient();
    const { error } = await supabase
      .from("leaders")
      .update({ profile_id: null })
      .eq("id", leaderId);

    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/leader-accounts");
    revalidatePath("/superadmin/leaders");

    return "Leader account unlinked.";
  });
}

export async function inviteLeaderAccount(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const leaderId = required(formData, "leader_id", "Leader");
    const email = required(formData, "email", "Email").toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }

    const supabase = await createClient();
    const { data: leader, error: leaderError } = await supabase
      .from("leaders")
      .select("name, profile_id")
      .eq("id", leaderId)
      .maybeSingle();

    if (leaderError) throw new Error(leaderError.message);
    if (!leader) throw new Error("The selected leadership profile no longer exists.");
    if (leader.profile_id) {
      throw new Error("This leader already has an account linked. Unlink it first.");
    }

    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .ilike("email", email)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);

    if (existingProfile) {
      const { data: linked, error: linkError } = await supabase
        .from("leaders")
        .update({ profile_id: existingProfile.id })
        .eq("id", leaderId)
        .is("profile_id", null)
        .select("id")
        .maybeSingle();

      if (linkError) throw new Error(linkError.message);
      if (!linked) throw new Error("This leader was linked by another admin. Refresh and try again.");

      revalidatePath("/superadmin/leader-accounts");
      revalidatePath("/superadmin/leaders");
      return `${existingProfile.full_name || email} linked to ${leader.name}.`;
    }

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: leader.name },
      redirectTo: `${SITE_URL}/auth/set-password`,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("The invitation did not return a user record.");

    const { data: linked, error: linkError } = await admin
      .from("leaders")
      .update({ profile_id: data.user.id })
      .eq("id", leaderId)
      .is("profile_id", null)
      .select("id")
      .maybeSingle();

    if (linkError || !linked) {
      const { error: cleanupError } = await admin.auth.admin.deleteUser(data.user.id);
      if (cleanupError) {
        throw new Error(`The leader link failed, and the invited account could not be removed: ${cleanupError.message}`);
      }

      if (linkError) throw new Error(linkError.message);
      throw new Error("This leader was linked by another admin. The invitation was canceled.");
    }

    revalidatePath("/superadmin/leader-accounts");
    revalidatePath("/superadmin/leaders");

    return `Invitation sent to ${email}. They can set their own password from the email link.`;
  });
}

export async function linkContentToLeader(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const leaderId = required(formData, "leader_id", "Leader");
    const [contentType, contentId] = required(formData, "content", "Content").split(":");
    const role = oneOf(required(formData, "role", "Role"), COLLABORATION_ROLES, "Role");

    oneOf(contentType ?? "", CONTENT_TYPES, "Content type");

    if (!contentId) {
      throw new Error("Please select an item to link.");
    }

    const supabase = await createClient();
    const { error } = await supabase.from("content_leaders").upsert(
      { content_type: contentType, content_id: contentId, leader_id: leaderId, role },
      { onConflict: "content_type,content_id,leader_id" }
    );
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/leaders");
    revalidatePath("/leadership", "layout");
    revalidatePath(`/${contentType}s`, "layout");

    return role === "lead" ? "Linked as lead." : "Linked as collaboration partner.";
  });
}

export async function unlinkContentFromLeader(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const contentType = oneOf(required(formData, "content_type", "Content type"), CONTENT_TYPES, "Content type");
    const contentId = required(formData, "content_id", "Content");
    const leaderId = required(formData, "leader_id", "Leader");

    const supabase = await createClient();
    const { error } = await supabase
      .from("content_leaders")
      .delete()
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("leader_id", leaderId);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/leaders");
    revalidatePath("/leadership", "layout");

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

    const supabase = await createClient();

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

    const supabase = await createClient();

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

    const supabase = await createClient();

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

    const category =
      optional(formData, "category");

    const priorityValue =
      Number.parseInt(
        text(formData, "priority") || "100",
        10
      );

    const supabase =
      await createClient();

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

    const supabase =
      await createClient();

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