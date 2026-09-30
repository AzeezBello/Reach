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

export async function createLeader(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  return run(async () => {
    await guard();

    const name = required(formData, "name", "Full name");
    const sortOrder = Number.parseInt(text(formData, "sort_order") || "0", 10);

    const input = {
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

    const supabase = await createClient();
    const { error } = await supabase.from("leaders").insert(input);
    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/leaders");
    revalidatePath("/leadership");
    revalidatePath("/", "layout");

    return `Created the profile for ${name}.`;
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
