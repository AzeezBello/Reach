"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/components/action-form";
import { getCurrentUser } from "@/lib/reach";
import { createClient } from "@/lib/supabase/server";

/** Toggle the signed-in resident's RSVP for an event. */
export async function toggleRsvp(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Please sign in to RSVP." };
  }

  const eventId = formData.get("event_id");
  const slug = formData.get("slug");
  const attending = formData.get("attending") === "true";

  if (typeof eventId !== "string" || typeof slug !== "string") {
    return { ok: false, message: "This event could not be found." };
  }

  const supabase = await createClient();

  const { error } = attending
    ? await supabase
        .from("event_rsvps")
        .delete()
        .eq("event_id", eventId)
        .eq("resident_id", user.id)
    : await supabase
        .from("event_rsvps")
        .upsert({ event_id: eventId, resident_id: user.id }, { onConflict: "event_id,resident_id" });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/events/${slug}`);
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: attending ? "Your RSVP has been removed." : "You are on the attendee list.",
  };
}
