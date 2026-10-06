"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/components/action-form";
import { getCurrentUser } from "@/lib/reach";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfile(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Please sign in again to update your profile." };
  }

  const fullName = text(formData, "full_name");
  const phone = text(formData, "phone");
  const jurisdictionId = text(formData, "jurisdiction_id");

  if (fullName.length < 2) {
    return { ok: false, message: "Please enter your full name." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      phone: phone || null,
      email: user.email ?? null,
      ...(formData.has("jurisdiction_id") ? { jurisdiction_id: jurisdictionId || null } : {}),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard");

  return { ok: true, message: "Profile updated." };
}
