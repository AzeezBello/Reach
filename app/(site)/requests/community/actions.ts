"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/components/action-form";
import { createClient } from "@/lib/supabase/server";

export type SupportState = (ActionState & { supported?: boolean; count?: number }) | null;

/**
 * Adds or withdraws the signed-in resident's support for a shared request.
 * Signed-out residents are sent to sign in and brought back afterwards.
 */
export async function toggleRequestSupport(
  _state: SupportState,
  formData: FormData
): Promise<SupportState> {
  const id = String(formData.get("id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/requests/community");
  const current = Number.parseInt(String(formData.get("count") ?? "0"), 10) || 0;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  const { data, error } = await supabase.rpc("toggle_request_support", { target_request: id });

  if (error) {
    return { ok: false, message: error.message };
  }

  const supported = Boolean(data);

  revalidatePath("/requests/community");
  revalidatePath(`/requests/community/${id}`);

  return {
    ok: true,
    supported,
    count: Math.max(0, current + (supported ? 1 : -1)),
    message: supported ? "Thanks for supporting this request." : "Your support has been withdrawn.",
  };
}

/** Lets a resident share or unshare one of their own requests. */
export async function setRequestVisibility(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const makePublic = formData.get("make_public") === "true";

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_request_visibility", {
    target_request: id,
    make_public: makePublic,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/requests/${id}`);
  revalidatePath("/requests/community");

  return {
    ok: true,
    message: makePublic
      ? "Your request is now visible to other residents, who can add their support."
      : "Your request is private again.",
  };
}
