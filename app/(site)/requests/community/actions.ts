"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/components/action-form";
import { ensureCommunitySocialSchema } from "@/lib/community";
import { EMPTY_REACTIONS } from "@/lib/community-utils";
import { neonSql } from "@/lib/neon/client";
import { createClient } from "@/lib/neon/server";
import type {
  ReactionCounts,
  ReactionKind,
  RequestComment,
} from "@/lib/types";

export type SupportState =
  | (ActionState & { supported?: boolean; count?: number })
  | null;

const VALID_REACTIONS = new Set<ReactionKind>([
  "urgent",
  "affected",
  "safety",
  "resolved_check",
]);

/**
 * Adds or withdraws the signed-in resident's support for a shared request.
 * Signed-out residents are sent to sign in and brought back afterwards.
 */
export async function toggleRequestSupport(
  _state: SupportState,
  formData: FormData,
): Promise<SupportState> {
  const id = String(formData.get("id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/requests/community");
  const current =
    Number.parseInt(String(formData.get("count") ?? "0"), 10) || 0;

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  const { data, error } = await db.rpc("toggle_request_support", {
    target_request: id,
  });

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
    message: supported
      ? "Thanks for supporting this request."
      : "Your support has been withdrawn.",
  };
}

/** Lets a resident share or unshare one of their own requests. */
export async function setRequestVisibility(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const makePublic = formData.get("make_public") === "true";

  const db = await createClient();
  const { error } = await db.rpc("set_request_visibility", {
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

export type ReactionActionResult = {
  ok: boolean;
  requiresAuth?: boolean;
  loginUrl?: string;
  active?: boolean;
  reactions?: ReactionCounts;
  myReactions?: ReactionKind[];
  message?: string;
};

/**
 * Toggles a civic priority reaction (`urgent`, `affected`, `safety`, `resolved_check`)
 * on a public community request.
 */
export async function toggleRequestReaction(input: {
  requestId: string;
  reaction: ReactionKind;
  returnTo?: string;
}): Promise<ReactionActionResult> {
  const { requestId, reaction, returnTo = "/requests/community" } = input;

  if (!/^[0-9a-f-]{36}$/i.test(requestId) || !VALID_REACTIONS.has(reaction)) {
    return { ok: false, message: "Invalid reaction request." };
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    return {
      ok: false,
      requiresAuth: true,
      loginUrl: `/login?next=${encodeURIComponent(returnTo)}`,
      message: "Sign in to react and boost this issue's priority.",
    };
  }

  await ensureCommunitySocialSchema();

  try {
    const existing = await neonSql<{ reaction: string }>(
      `SELECT reaction FROM public.request_reactions
       WHERE request_id = $1::uuid AND resident_id = $2::uuid AND reaction = $3`,
      [requestId, user.id, reaction],
    );

    let active = false;
    if (existing.rowCount > 0) {
      await neonSql(
        `DELETE FROM public.request_reactions
         WHERE request_id = $1::uuid AND resident_id = $2::uuid AND reaction = $3`,
        [requestId, user.id, reaction],
      );
      active = false;
    } else {
      await neonSql(
        `INSERT INTO public.request_reactions (request_id, resident_id, reaction)
         VALUES ($1::uuid, $2::uuid, $3)
         ON CONFLICT (request_id, resident_id, reaction) DO NOTHING`,
        [requestId, user.id, reaction],
      );
      active = true;
    }

    const [countsRes, mineRes] = await Promise.all([
      neonSql<{ reaction: ReactionKind; cnt: number }>(
        `SELECT reaction, count(*)::int AS cnt
         FROM public.request_reactions
         WHERE request_id = $1::uuid
         GROUP BY reaction`,
        [requestId],
      ),
      neonSql<{ reaction: ReactionKind }>(
        `SELECT reaction
         FROM public.request_reactions
         WHERE request_id = $1::uuid AND resident_id = $2::uuid`,
        [requestId, user.id],
      ),
    ]);

    const reactions: ReactionCounts = { ...EMPTY_REACTIONS };
    for (const r of countsRes.rows) {
      if (r.reaction in reactions) {
        reactions[r.reaction] = Number(r.cnt) || 0;
      }
    }

    const myReactions = mineRes.rows.map((r) => r.reaction);

    revalidatePath("/requests/community");
    revalidatePath(`/requests/community/${requestId}`);

    return {
      ok: true,
      active,
      reactions,
      myReactions,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error ? err.message : "Could not record reaction.",
    };
  }
}

export type CommentActionResult = {
  ok: boolean;
  requiresAuth?: boolean;
  loginUrl?: string;
  comment?: RequestComment;
  message?: string;
};

/**
 * Adds a resident corroboration comment or field update to a shared request.
 */
export async function addRequestComment(input: {
  requestId: string;
  body: string;
  isMeToo?: boolean;
  postcode?: string | null;
  showFirstName?: boolean;
  returnTo?: string;
}): Promise<CommentActionResult> {
  const {
    requestId,
    body,
    isMeToo = false,
    postcode = null,
    showFirstName = false,
    returnTo = "/requests/community",
  } = input;

  if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
    return { ok: false, message: "Invalid request." };
  }

  const trimmed = body.trim();
  if (trimmed.length < 2) {
    return {
      ok: false,
      message: "Please write a short comment (at least 2 characters).",
    };
  }
  if (trimmed.length > 1000) {
    return {
      ok: false,
      message: "Comments must be 1,000 characters or fewer.",
    };
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    return {
      ok: false,
      requiresAuth: true,
      loginUrl: `/login?next=${encodeURIComponent(returnTo)}`,
      message: "Sign in to comment and corroborate this request.",
    };
  }

  await ensureCommunitySocialSchema();

  try {
    // Resolve resident's home area & first name for privacy-safe label
    const profileRes = await neonSql<{
      full_name: string | null;
      area_name: string | null;
    }>(
      `SELECT p.full_name, j.name AS area_name
       FROM public.profiles p
       LEFT JOIN public.jurisdictions j ON j.id = p.jurisdiction_id
       WHERE p.id = $1::uuid
       LIMIT 1`,
      [user.id],
    );

    const profileRow = profileRes.rows[0];
    const firstName = (
      profileRow?.full_name ||
      (user.user_metadata?.full_name as string | undefined) ||
      ""
    )
      .trim()
      .split(/\s+/)[0];

    const authorLabel =
      showFirstName && firstName
        ? `${firstName} (Verified Resident)`
        : "Verified Resident";

    const areaName = profileRow?.area_name ?? null;
    const cleanPostcode =
      postcode && postcode.trim().length > 0
        ? postcode.trim().toUpperCase().slice(0, 24)
        : null;

    const inserted = await neonSql<{
      id: string;
      request_id: string;
      author_label: string;
      area_name: string | null;
      postcode: string | null;
      body: string;
      is_me_too: boolean;
      created_at: string;
    }>(
      `INSERT INTO public.request_comments (
         request_id, resident_id, author_label, area_name, postcode, body, is_me_too
       ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7)
       RETURNING id::text, request_id::text, author_label, area_name, postcode, body, is_me_too, created_at`,
      [
        requestId,
        user.id,
        authorLabel,
        areaName,
        cleanPostcode,
        trimmed,
        Boolean(isMeToo),
      ],
    );

    if (isMeToo) {
      await neonSql(
        `INSERT INTO public.request_reactions (request_id, resident_id, reaction)
         VALUES ($1::uuid, $2::uuid, 'affected')
         ON CONFLICT (request_id, resident_id, reaction) DO NOTHING`,
        [requestId, user.id],
      );
    }

    const row = inserted.rows[0];

    revalidatePath("/requests/community");
    revalidatePath(`/requests/community/${requestId}`);

    return {
      ok: true,
      comment: {
        id: row.id,
        request_id: row.request_id,
        author_label: row.author_label,
        area_name: row.area_name,
        postcode: row.postcode,
        body: row.body,
        is_me_too: Boolean(row.is_me_too),
        created_at: row.created_at,
        is_mine: true,
      },
      message: "Your comment has been added and boosted this issue's priority.",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not post comment.",
    };
  }
}

export async function deleteRequestComment(input: {
  commentId: string;
  requestId: string;
}): Promise<{ ok: boolean; message?: string }> {
  const { commentId, requestId } = input;
  if (
    !/^[0-9a-f-]{36}$/i.test(commentId) ||
    !/^[0-9a-f-]{36}$/i.test(requestId)
  ) {
    return { ok: false, message: "Invalid comment id." };
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sign in required." };
  }

  await ensureCommunitySocialSchema();

  try {
    await neonSql(
      `DELETE FROM public.request_comments
       WHERE id = $1::uuid AND request_id = $2::uuid AND resident_id = $3::uuid`,
      [commentId, requestId, user.id],
    );
    revalidatePath("/requests/community");
    revalidatePath(`/requests/community/${requestId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not delete comment.",
    };
  }
}
