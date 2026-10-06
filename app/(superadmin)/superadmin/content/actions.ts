"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/components/action-form";
import { getSuperadminAccess } from "@/lib/admin";
import {
  CONTENT_KINDS,
  fromLagosInput,
  hasSummary,
  isContentKind,
  type ContentKind,
} from "@/lib/content-admin";
import { createAdminClient } from "@/lib/supabase/admin-client";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

async function guard() {
  const access = await getSuperadminAccess();

  if (!access.user || !access.allowed) {
    throw new Error("You do not have permission to manage content.");
  }

  return access.user;
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

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

function kindOf(formData: FormData): ContentKind {
  const value = text(formData, "kind");

  if (!isContentKind(value)) {
    throw new Error("Unknown content type.");
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

function revalidateKind(kind: ContentKind, slug?: string) {
  const config = CONTENT_KINDS[kind];

  revalidatePath("/");
  revalidatePath(config.publicPath);
  if (slug) revalidatePath(`${config.publicPath}/${slug}`);
  revalidatePath("/superadmin/content");
  revalidatePath("/superadmin/events");
  revalidatePath("/leadership", "layout");
  revalidatePath("/sitemap.xml");
}

/** Uploads a chosen image to the public `media` bucket and returns its URL. */
async function uploadImage(file: File, kind: ContentKind, slug: string) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 10 MB or smaller.");
  }

  const extension = IMAGE_TYPES[file.type];

  if (!extension) {
    throw new Error("Upload a JPEG, PNG, WebP or GIF image.");
  }

  const supabase = createAdminClient();
  const path = `${CONTENT_KINDS[kind].table}/${slug}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

/** Builds the row payload for a kind from the submitted form. */
function buildPayload(kind: ContentKind, formData: FormData, slug: string) {
  const config = CONTENT_KINDS[kind];
  const status = required(formData, "status", "Status");

  if (!config.statuses.includes(status)) {
    throw new Error("Status is not a valid choice.");
  }

  const payload: Record<string, unknown> = {
    title: required(formData, "title", "Title"),
    slug,
    status,
    description: optional(formData, "description"),
    organization_id: required(formData, "organization_id", "Organization"),
    jurisdiction_id: optional(formData, "jurisdiction_id"),
    office_id: optional(formData, "office_id"),
  };

  if (hasSummary(kind)) {
    payload.summary = optional(formData, "summary");
  }

  for (const field of config.fields) {
    const raw = text(formData, field.name);

    switch (field.type) {
      case "checkbox":
        payload[field.name] = formData.get(field.name) === "on";
        break;

      case "number": {
        if (!raw) {
          payload[field.name] = null;
          break;
        }
        const number = Number.parseInt(raw, 10);
        if (Number.isNaN(number) || number < 0) {
          throw new Error(`${field.label} must be a whole number.`);
        }
        payload[field.name] = number;
        break;
      }

      case "datetime":
        if (field.required && !raw) {
          throw new Error(`${field.label} is required.`);
        }
        payload[field.name] = fromLagosInput(raw);
        break;

      case "url":
        if (raw && !/^https?:\/\//.test(raw)) {
          throw new Error(`${field.label} must start with http:// or https://.`);
        }
        payload[field.name] = raw || null;
        break;

      case "select":
        if (field.required && !raw) {
          throw new Error(`${field.label} is required.`);
        }
        if (raw && field.options && !field.options.some((option) => option.value === raw)) {
          throw new Error(`${field.label} is not a valid choice.`);
        }
        payload[field.name] = raw || null;
        break;

      default:
        if (field.required && !raw) {
          throw new Error(`${field.label} is required.`);
        }
        payload[field.name] = raw || null;
    }
  }

  if (kind === "event" && payload.ends_at && payload.starts_at) {
    if (new Date(payload.ends_at as string) < new Date(payload.starts_at as string)) {
      throw new Error("The event cannot end before it starts.");
    }
  }

  return payload;
}

/** Replaces the leader credits for one item. Values are "leaderId:role". */
async function saveCredits(kind: ContentKind, id: string, formData: FormData) {
  const supabase = createAdminClient();

  const credits = formData
    .getAll("leaders")
    .filter((value): value is string => typeof value === "string" && value.includes(":"))
    .map((value) => {
      const [leaderId, role] = value.split(":");
      return { leader_id: leaderId, role: role === "partner" ? "partner" : "lead" };
    });

  const { error: clearError } = await supabase
    .from("content_leaders")
    .delete()
    .eq("content_type", kind)
    .eq("content_id", id);

  if (clearError) {
    throw new Error(`Leader credits could not be updated: ${clearError.message}`);
  }

  if (credits.length > 0) {
    const { error } = await supabase.from("content_leaders").insert(
      credits.map((credit) => ({ content_type: kind, content_id: id, ...credit }))
    );

    if (error) {
      throw new Error(`Leader credits could not be saved: ${error.message}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

/**
 * Creates or updates one programme, opportunity, project or event.
 * New items redirect to their editor once saved.
 */
export async function saveContent(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  let createdId: string | null = null;
  let kind: ContentKind | null = null;

  try {
    await guard();

    kind = kindOf(formData);
    const config = CONTENT_KINDS[kind];
    const id = optional(formData, "id");
    const slug = slugify(text(formData, "slug") || required(formData, "title", "Title"));

    if (!slug) {
      throw new Error("Enter a title or slug.");
    }

    const payload = buildPayload(kind, formData, slug);

    const image = formData.get("image_file");
    if (image instanceof File && image.size > 0) {
      payload.image_url = await uploadImage(image, kind, slug);
    } else {
      payload.image_url = optional(formData, "image_url");
    }

    const supabase = createAdminClient();

    if (id) {
      const { error } = await supabase
        .from(config.table)
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw new Error(error.message);

      await saveCredits(kind, id, formData);
      revalidateKind(kind, slug);

      return { ok: true, message: `${config.label} saved.` };
    }

    const { data, error } = await supabase
      .from(config.table)
      .insert(payload)
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    createdId = data.id as string;
    await saveCredits(kind, createdId, formData);
    revalidateKind(kind, slug);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }

  redirect(`/superadmin/content/${kind}/${createdId}?created=1`);
}

export async function setContentStatus(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await guard();

    const kind = kindOf(formData);
    const config = CONTENT_KINDS[kind];
    const id = required(formData, "id", "Item");
    const status = required(formData, "status", "Status");

    if (!config.statuses.includes(status)) {
      throw new Error("Status is not a valid choice.");
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(config.table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) throw new Error(error.message);

    revalidateKind(kind, data.slug as string);

    return { ok: true, message: `Status set to ${status.replace(/_/g, " ")}.` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
}

export async function deleteContent(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  let kind: ContentKind | null = null;

  try {
    await guard();

    kind = kindOf(formData);
    const config = CONTENT_KINDS[kind];
    const id = required(formData, "id", "Item");

    const supabase = createAdminClient();

    await supabase.from("content_leaders").delete().eq("content_type", kind).eq("content_id", id);

    const { error } = await supabase.from(config.table).delete().eq("id", id);

    if (error) {
      throw new Error(
        error.code === "23503"
          ? "This item has linked records (such as applications or RSVPs). Archive it instead of deleting it."
          : error.message
      );
    }

    revalidateKind(kind);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }

  redirect(`/superadmin/content?kind=${kind}&deleted=1`);
}
