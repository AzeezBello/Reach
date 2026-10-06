"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/components/action-form";
import { getSuperadminAccess } from "@/lib/admin";
import { SITE_URL } from "@/lib/config";
import { LIMITED_ROLES, RESIDENT_ROLES, type ResidentRole } from "@/lib/residents";
import { createAdminClient } from "@/lib/supabase/admin-client";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

async function guard() {
  const access = await getSuperadminAccess();

  if (!access.user || !access.allowed) {
    throw new Error("You do not have permission to manage residents.");
  }

  return { actorId: access.user.id, actorRole: access.profile?.role ?? "admin" };
}

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optional(formData: FormData, name: string) {
  return text(formData, name) || null;
}

function required(formData: FormData, name: string, label: string) {
  const value = text(formData, name);
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function email(formData: FormData) {
  const value = required(formData, "email", "Email").toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error("Enter a valid email address.");
  }

  return value;
}

function role(formData: FormData, actorRole: string): ResidentRole {
  const value = text(formData, "role") || "resident";

  if (!(RESIDENT_ROLES as readonly string[]).includes(value)) {
    throw new Error("Role is not a valid choice.");
  }

  if (actorRole !== "superadmin" && !LIMITED_ROLES.includes(value as ResidentRole)) {
    throw new Error("Only a superadmin can grant admin or superadmin access.");
  }

  return value as ResidentRole;
}

function fail(error: unknown): ActionState {
  return { ok: false, message: error instanceof Error ? error.message : "Something went wrong." };
}

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */

/**
 * Creates a resident account. Either sends a Supabase invitation (the
 * resident sets their own password from the email) or creates the account
 * immediately with a temporary password the admin passes on.
 */
export async function createResident(_state: ActionState, formData: FormData): Promise<ActionState> {
  let createdId: string | null = null;

  try {
    const { actorRole } = await guard();

    const fullName = required(formData, "full_name", "Full name");
    const address = email(formData);
    const nextRole = role(formData, actorRole);
    const phone = optional(formData, "phone");
    const jurisdictionId = optional(formData, "jurisdiction_id");
    const homeAddress = optional(formData, "address");
    const mode = text(formData, "mode") === "password" ? "password" : "invite";
    const password = text(formData, "password");

    if (mode === "password" && password.length < 8) {
      throw new Error("Temporary passwords must be at least 8 characters.");
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase.from("profiles").select("id").ilike("email", address).maybeSingle();
    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const metadata = { full_name: fullName, jurisdiction_id: jurisdictionId, address: homeAddress };

    const result =
      mode === "password"
        ? await supabase.auth.admin.createUser({
            email: address,
            password,
            email_confirm: true,
            user_metadata: metadata,
          })
        : await supabase.auth.admin.inviteUserByEmail(address, {
            data: metadata,
            redirectTo: `${SITE_URL}/auth/callback?next=/auth/set-password`,
          });

    if (result.error) throw new Error(result.error.message);
    if (!result.data.user) throw new Error("Supabase did not return the new user.");

    createdId = result.data.user.id;

    /* The sign-up trigger creates the profile; make sure every field is set. */
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: createdId,
        email: address,
        full_name: fullName,
        phone,
        role: nextRole,
        jurisdiction_id: jurisdictionId,
        address: homeAddress,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) throw new Error(profileError.message);

    revalidatePath("/superadmin/residents");
    revalidatePath("/superadmin");
  } catch (error) {
    return fail(error);
  }

  redirect(`/superadmin/residents/${createdId}?created=1`);
}

/* ------------------------------------------------------------------ */
/* Update                                                              */
/* ------------------------------------------------------------------ */

export async function updateResident(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { actorId, actorRole } = await guard();

    const id = required(formData, "id", "Resident");
    const fullName = required(formData, "full_name", "Full name");
    const address = email(formData);
    const nextRole = role(formData, actorRole);

    if (id === actorId && nextRole !== actorRole) {
      throw new Error("You cannot change your own role.");
    }

    const supabase = createAdminClient();

    const { data: current } = await supabase.from("profiles").select("email, role").eq("id", id).maybeSingle();
    if (!current) throw new Error("Resident not found.");

    if (actorRole !== "superadmin" && (current.role === "admin" || current.role === "superadmin") && id !== actorId) {
      throw new Error("Only a superadmin can edit another admin's account.");
    }

    if (current.email?.toLowerCase() !== address) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, { email: address, email_confirm: true });
      if (authError) throw new Error(authError.message);
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        email: address,
        phone: optional(formData, "phone"),
        role: nextRole,
        jurisdiction_id: optional(formData, "jurisdiction_id"),
        address: optional(formData, "address"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/superadmin/residents");
    revalidatePath(`/superadmin/residents/${id}`);

    return { ok: true, message: "Resident saved." };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------------------------------------------ */
/* Suspend / reinstate                                                 */
/* ------------------------------------------------------------------ */

const SUSPEND_DURATION = "876000h"; // 100 years: suspended until reinstated

export async function setResidentSuspended(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { actorId, actorRole } = await guard();

    const id = required(formData, "id", "Resident");
    const suspend = text(formData, "suspend") === "true";

    if (id === actorId) throw new Error("You cannot suspend your own account.");

    const supabase = createAdminClient();

    const { data: target } = await supabase.from("profiles").select("role, full_name").eq("id", id).maybeSingle();
    if (!target) throw new Error("Resident not found.");

    if (actorRole !== "superadmin" && (target.role === "admin" || target.role === "superadmin")) {
      throw new Error("Only a superadmin can suspend an admin.");
    }

    const { error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: suspend ? SUSPEND_DURATION : "none",
    });

    if (error) throw new Error(error.message);

    if (suspend) {
      /* End any open sessions so the suspension takes effect immediately. */
      await supabase.auth.admin.signOut(id, "global").catch(() => undefined);
    }

    revalidatePath("/superadmin/residents");
    revalidatePath(`/superadmin/residents/${id}`);

    return {
      ok: true,
      message: suspend
        ? `${target.full_name || "The resident"} is suspended and signed out everywhere.`
        : `${target.full_name || "The resident"} can sign in again.`,
    };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------------------------------------------ */
/* Delete                                                              */
/* ------------------------------------------------------------------ */

export async function deleteResident(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { actorId, actorRole } = await guard();

    const id = required(formData, "id", "Resident");

    if (id === actorId) throw new Error("You cannot delete your own account.");
    if (formData.get("confirm") !== "on") {
      throw new Error("Tick the confirmation box to delete this resident.");
    }

    const supabase = createAdminClient();

    const { data: target } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();

    if (target && actorRole !== "superadmin" && (target.role === "admin" || target.role === "superadmin")) {
      throw new Error("Only a superadmin can delete an admin.");
    }

    /* Deleting the auth user cascades to the profile, requests, RSVPs and supports. */
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error && !/not found/i.test(error.message)) throw new Error(error.message);

    await supabase.from("profiles").delete().eq("id", id);

    revalidatePath("/superadmin/residents");
    revalidatePath("/superadmin");
  } catch (error) {
    return fail(error);
  }

  redirect("/superadmin/residents?deleted=1");
}
