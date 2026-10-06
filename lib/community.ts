import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { PublicRequest } from "@/lib/types";

/*
 * Community requests: requests residents chose to share publicly so other
 * residents can see them and add their support. Everything here reads the
 * `public_requests` view, which exposes no resident identity.
 */

const PUBLIC_REQUEST_FIELDS =
  "id, reference_no, category, subject, description, status, created_at, updated_at, jurisdiction_id, jurisdiction_name, jurisdiction_type, support_count";

export type CommunityFilters = {
  category?: string | null;
  jurisdiction?: string | null;
  sort?: "newest" | "supported";
};

export type CommunityResult = {
  requests: PublicRequest[];
  categories: string[];
  areas: { id: string; name: string }[];
  /** False when the database does not have the community tables yet. */
  available: boolean;
};

export async function getPublicRequests(filters: CommunityFilters = {}): Promise<CommunityResult> {
  const supabase = createPublicClient();

  let query = supabase.from("public_requests").select(PUBLIC_REQUEST_FIELDS).limit(200);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.jurisdiction) query = query.eq("jurisdiction_id", filters.jurisdiction);

  query =
    filters.sort === "supported"
      ? query.order("support_count", { ascending: false }).order("created_at", { ascending: false })
      : query.order("created_at", { ascending: false });

  const [{ data, error }, facets] = await Promise.all([
    query,
    supabase
      .from("public_requests")
      .select("category, jurisdiction_id, jurisdiction_name")
      .limit(1000),
  ]);

  if (error) {
    console.error("Community requests are unavailable:", error.message);
    return { requests: [], categories: [], areas: [], available: false };
  }

  const rows = (facets.data ?? []) as Pick<
    PublicRequest,
    "category" | "jurisdiction_id" | "jurisdiction_name"
  >[];

  const categories = [...new Set(rows.map((row) => row.category).filter((c): c is string => Boolean(c)))].sort();

  const areaMap = new Map<string, string>();
  for (const row of rows) {
    if (row.jurisdiction_id && row.jurisdiction_name) areaMap.set(row.jurisdiction_id, row.jurisdiction_name);
  }
  const areas = [...areaMap].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));

  return { requests: (data ?? []) as PublicRequest[], categories, areas, available: true };
}

export async function getPublicRequest(id: string): Promise<PublicRequest | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("public_requests")
    .select(PUBLIC_REQUEST_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) return null;

  return (data as PublicRequest | null) ?? null;
}

/** Ids of the public requests the signed-in resident has supported. */
export async function getMySupportedRequestIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("request_supports").select("request_id");

  return new Set(((data ?? []) as { request_id: string }[]).map((row) => row.request_id));
}

/** Support count for one request, including the owner's private view. */
export async function getRequestSupportCount(id: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("request_support_count", { target_request: id });

  return error || typeof data !== "number" ? 0 : data;
}
