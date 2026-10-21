import {
  EMPTY_REACTIONS,
  calculatePriorityScore,
  getPriorityTier,
} from "@/lib/community-utils";
import { neonSql } from "@/lib/neon/client";
import { createPublicClient } from "@/lib/neon/public";
import { createClient } from "@/lib/neon/server";
import type {
  PublicRequest,
  ReactionCounts,
  ReactionKind,
  RequestComment,
} from "@/lib/types";

const PUBLIC_REQUEST_FIELDS =
  "id, reference_no, category, subject, description, status, created_at, updated_at, jurisdiction_id, jurisdiction_name, jurisdiction_type, support_count";

export type CommunitySort = "priority" | "supported" | "discussed" | "newest";

export type CommunityFilters = {
  category?: string | null;
  jurisdiction?: string | null;
  sort?: CommunitySort;
  q?: string | null;
  userId?: string | null;
};

export type CommunityResult = {
  requests: PublicRequest[];
  categories: string[];
  areas: { id: string; name: string }[];
  stats: {
    totalRequests: number;
    totalSupports: number;
    totalReactions: number;
    totalComments: number;
    highPriorityCount: number;
  };
  /** False when the database does not have the community tables yet. */
  available: boolean;
};

let socialSchemaReady = false;

export async function ensureCommunitySocialSchema(): Promise<void> {
  if (socialSchemaReady) return;
  try {
    await neonSql(`
      CREATE TABLE IF NOT EXISTS public.request_reactions (
        request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
        resident_id uuid NOT NULL,
        reaction text NOT NULL CHECK (reaction IN ('urgent', 'affected', 'safety', 'resolved_check')),
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (request_id, resident_id, reaction)
      );
      CREATE INDEX IF NOT EXISTS idx_request_reactions_request_id
        ON public.request_reactions (request_id);

      CREATE TABLE IF NOT EXISTS public.request_comments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
        resident_id uuid NOT NULL,
        author_label text NOT NULL DEFAULT 'Verified Resident',
        area_name text,
        postcode text,
        body text NOT NULL CHECK (char_length(body) BETWEEN 2 AND 1000),
        is_me_too boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_request_comments_request_id
        ON public.request_comments (request_id, created_at DESC);
    `);
    socialSchemaReady = true;
  } catch (err) {
    console.warn("Community social schema check skipped:", err);
  }
}

async function enrichRequestsWithSocialData(
  rawRequests: PublicRequest[],
  userId?: string | null,
  commentLimitPerRequest = 5,
): Promise<PublicRequest[]> {
  if (rawRequests.length === 0) return [];

  await ensureCommunitySocialSchema();

  const ids = rawRequests.map((r) => r.id);
  const reactionsByRequest = new Map<string, ReactionCounts>();
  const myReactionsByRequest = new Map<string, ReactionKind[]>();
  const commentsByRequest = new Map<string, RequestComment[]>();
  const commentCountByRequest = new Map<string, number>();

  try {
    const placeholders = ids.map((_, idx) => `$${idx + 1}::uuid`).join(", ");

    const [reactionRowsRes, commentRowsRes, myReactionRowsRes] =
      await Promise.all([
        neonSql<{
          request_id: string;
          reaction: ReactionKind;
          cnt: number;
        }>(
          `SELECT request_id::text, reaction, count(*)::int AS cnt
           FROM public.request_reactions
           WHERE request_id IN (${placeholders})
           GROUP BY request_id, reaction`,
          ids,
        ),
        neonSql<{
          id: string;
          request_id: string;
          resident_id: string;
          author_label: string;
          area_name: string | null;
          postcode: string | null;
          body: string;
          is_me_too: boolean;
          created_at: string;
        }>(
          `SELECT id::text, request_id::text, resident_id::text, author_label, area_name, postcode, body, is_me_too, created_at
           FROM public.request_comments
           WHERE request_id IN (${placeholders})
           ORDER BY created_at DESC
           LIMIT 300`,
          ids,
        ),
        userId
          ? neonSql<{ request_id: string; reaction: ReactionKind }>(
              `SELECT request_id::text, reaction
               FROM public.request_reactions
               WHERE request_id IN (${placeholders})
                 AND resident_id = $${ids.length + 1}::uuid`,
              [...ids, userId],
            )
          : Promise.resolve({ rows: [] as { request_id: string; reaction: ReactionKind }[] }),
      ]);

    for (const row of reactionRowsRes.rows) {
      const current = reactionsByRequest.get(row.request_id) ?? {
        ...EMPTY_REACTIONS,
      };
      if (row.reaction in current) {
        current[row.reaction] = Number(row.cnt) || 0;
      }
      reactionsByRequest.set(row.request_id, current);
    }

    for (const row of myReactionRowsRes.rows) {
      const list = myReactionsByRequest.get(row.request_id) ?? [];
      if (!list.includes(row.reaction)) {
        list.push(row.reaction);
      }
      myReactionsByRequest.set(row.request_id, list);
    }

    for (const row of commentRowsRes.rows) {
      const total = (commentCountByRequest.get(row.request_id) ?? 0) + 1;
      commentCountByRequest.set(row.request_id, total);

      const list = commentsByRequest.get(row.request_id) ?? [];
      if (list.length < commentLimitPerRequest) {
        list.push({
          id: row.id,
          request_id: row.request_id,
          author_label: row.author_label,
          area_name: row.area_name,
          postcode: row.postcode,
          body: row.body,
          is_me_too: Boolean(row.is_me_too),
          created_at: row.created_at,
          is_mine: Boolean(userId && row.resident_id === userId),
        });
        commentsByRequest.set(row.request_id, list);
      }
    }
  } catch (err) {
    console.warn("Unable to enrich community requests with social data:", err);
  }

  return rawRequests.map((req) => {
    const reactions = reactionsByRequest.get(req.id) ?? { ...EMPTY_REACTIONS };
    const my_reactions = myReactionsByRequest.get(req.id) ?? [];
    const comment_count = commentCountByRequest.get(req.id) ?? 0;
    const comments = (commentsByRequest.get(req.id) ?? []).slice().reverse();
    const priority_score = calculatePriorityScore(
      req.support_count ?? 0,
      reactions,
      comment_count,
    );
    const priority_tier = getPriorityTier(priority_score);

    return {
      ...req,
      reactions,
      my_reactions,
      comment_count,
      comments,
      priority_score,
      priority_tier,
    };
  });
}

export async function getPublicRequests(
  filters: CommunityFilters = {},
): Promise<CommunityResult> {
  const db = createPublicClient();

  let query = db
    .from("public_requests")
    .select(PUBLIC_REQUEST_FIELDS)
    .limit(200);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.jurisdiction)
    query = query.eq("jurisdiction_id", filters.jurisdiction);

  query =
    filters.sort === "supported"
      ? query
          .order("support_count", { ascending: false })
          .order("created_at", { ascending: false })
      : query.order("created_at", { ascending: false });

  const [{ data, error }, facets] = await Promise.all([
    query,
    db
      .from("public_requests")
      .select("category, jurisdiction_id, jurisdiction_name")
      .limit(1000),
  ]);

  if (error) {
    console.error("Community requests are unavailable:", error.message);
    return {
      requests: [],
      categories: [],
      areas: [],
      stats: {
        totalRequests: 0,
        totalSupports: 0,
        totalReactions: 0,
        totalComments: 0,
        highPriorityCount: 0,
      },
      available: false,
    };
  }

  const rows = (facets.data ?? []) as Pick<
    PublicRequest,
    "category" | "jurisdiction_id" | "jurisdiction_name"
  >[];

  const categories = [
    ...new Set(
      rows
        .map((row) => row.category)
        .filter((c): c is string => Boolean(c)),
    ),
  ].sort();

  const areaMap = new Map<string, string>();
  for (const row of rows) {
    if (row.jurisdiction_id && row.jurisdiction_name)
      areaMap.set(row.jurisdiction_id, row.jurisdiction_name);
  }
  const areas = [...areaMap]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  let enriched = await enrichRequestsWithSocialData(
    (data ?? []) as PublicRequest[],
    filters.userId,
    5,
  );

  // Filter by search query if provided
  const q = (filters.q ?? "").trim().toLowerCase();
  if (q) {
    enriched = enriched.filter(
      (item) =>
        item.subject.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q) ||
        (item.category ?? "").toLowerCase().includes(q) ||
        (item.jurisdiction_name ?? "").toLowerCase().includes(q) ||
        (item.reference_no ?? "").toLowerCase().includes(q),
    );
  }

  // Sort according to selected feed tab
  const sort = filters.sort ?? "priority";
  if (sort === "priority") {
    enriched.sort(
      (a, b) =>
        (b.priority_score ?? 0) - (a.priority_score ?? 0) ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else if (sort === "supported") {
    enriched.sort(
      (a, b) =>
        (b.support_count ?? 0) - (a.support_count ?? 0) ||
        (b.priority_score ?? 0) - (a.priority_score ?? 0),
    );
  } else if (sort === "discussed") {
    enriched.sort(
      (a, b) =>
        (b.comment_count ?? 0) - (a.comment_count ?? 0) ||
        (b.priority_score ?? 0) - (a.priority_score ?? 0),
    );
  } else {
    enriched.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  const stats = enriched.reduce(
    (acc, item) => {
      acc.totalRequests += 1;
      acc.totalSupports += item.support_count ?? 0;
      const r = item.reactions ?? EMPTY_REACTIONS;
      acc.totalReactions +=
        (r.urgent || 0) +
        (r.affected || 0) +
        (r.safety || 0) +
        (r.resolved_check || 0);
      acc.totalComments += item.comment_count ?? 0;
      if (
        item.priority_tier === "high" ||
        item.priority_tier === "critical"
      ) {
        acc.highPriorityCount += 1;
      }
      return acc;
    },
    {
      totalRequests: 0,
      totalSupports: 0,
      totalReactions: 0,
      totalComments: 0,
      highPriorityCount: 0,
    },
  );

  return {
    requests: enriched,
    categories,
    areas,
    stats,
    available: true,
  };
}

export async function getPublicRequest(
  id: string,
  userId?: string | null,
): Promise<PublicRequest | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const db = createPublicClient();
  const { data, error } = await db
    .from("public_requests")
    .select(PUBLIC_REQUEST_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const [enriched] = await enrichRequestsWithSocialData(
    [data as PublicRequest],
    userId,
    50,
  );

  return enriched ?? null;
}

/** Ids of the public requests the signed-in resident has supported. */
export async function getMySupportedRequestIds(): Promise<Set<string>> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return new Set();

  const { data } = await db
    .from("request_supports")
    .select("request_id")
    .eq("resident_id", user.id);

  return new Set(
    ((data ?? []) as { request_id: string }[]).map((row) => row.request_id),
  );
}

/** Support count for one request, including the owner's private view. */
export async function getRequestSupportCount(id: string): Promise<number> {
  const db = await createClient();
  const { data, error } = await db.rpc("request_support_count", {
    target_request: id,
  });

  return error || typeof data !== "number" ? 0 : data;
}
