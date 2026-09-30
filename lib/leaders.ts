import { cache } from "react";

import { staticLeaders } from "@/lib/leadership";
import { createClient } from "@/lib/supabase/server";
import type {
  CollaborationRole,
  ContentLeader,
  ContentType,
  Event,
  Leader,
  LeaderCredit,
  Opportunity,
  Programme,
  Project,
} from "@/lib/types";

const LEADER_FIELDS =
  "id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, is_active, sort_order";

const CONTENT_FIELDS: Record<ContentType, string> = {
  programme:
    "id, title, slug, summary, description, category, location, start_date, end_date, registration_deadline, status, capacity, image_url",
  opportunity:
    "id, title, slug, organization, type, summary, description, application_url, deadline, location, status, image_url",
  project:
    "id, title, slug, category, description, location, status, start_date, completion_date, beneficiary_count, image_url",
  event:
    "id, title, slug, summary, description, category, venue, location, starts_at, ends_at, registration_url, capacity, status, image_url, is_featured",
};

const CONTENT_TABLE: Record<ContentType, string> = {
  programme: "programmes",
  opportunity: "opportunities",
  project: "projects",
  event: "events",
};

/** Rows that residents are allowed to see per content type. */
const PUBLIC_FILTER: Record<ContentType, { column: string; values: string[] }> = {
  programme: { column: "status", values: ["open", "ongoing", "completed"] },
  opportunity: { column: "status", values: ["active"] },
  project: { column: "status", values: ["planned", "ongoing", "completed"] },
  event: { column: "status", values: ["published"] },
};

function normalize(row: Record<string, unknown>): Leader {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    role: row.role as string,
    level: (row.level as Leader["level"]) ?? null,
    level_label: (row.level_label as string | null) ?? null,
    office: (row.office as string | null) ?? null,
    jurisdiction: (row.jurisdiction as string | null) ?? null,
    constituency: (row.constituency as string | null) ?? null,
    summary: (row.summary as string | null) ?? null,
    biography: (row.biography as string[] | null) ?? [],
    service: (row.service as string[] | null) ?? [],
    sources: Array.isArray(row.sources)
      ? (row.sources as { label: string; url: string }[])
      : [],
    image_url: (row.image_url as string | null) ?? null,
    is_active: (row.is_active as boolean | undefined) ?? true,
    sort_order: (row.sort_order as number | undefined) ?? 0,
  };
}

/**
 * Active leadership profiles. Falls back to the built-in profiles when the
 * `leaders` table has not been migrated or seeded yet.
 */
export const getLeaders = cache(async (): Promise<Leader[]> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("leaders")
      .select(LEADER_FIELDS)
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    if (error || !data || data.length === 0) {
      return staticLeaders;
    }

    return (data as Record<string, unknown>[]).map(normalize);
  } catch {
    return staticLeaders;
  }
});

export async function getLeader(slug: string) {
  const leaders = await getLeaders();
  return leaders.find((leader) => leader.slug === slug) ?? null;
}

export type LeaderContent = {
  programmes: (Programme & { collaboration: CollaborationRole })[];
  opportunities: (Opportunity & { collaboration: CollaborationRole })[];
  projects: (Project & { collaboration: CollaborationRole })[];
  events: (Event & { collaboration: CollaborationRole })[];
};

const EMPTY_CONTENT: LeaderContent = {
  programmes: [],
  opportunities: [],
  projects: [],
  events: [],
};

/** Everything a leader leads or collaborates on. */
export async function getLeaderContent(leaderId: string | null): Promise<LeaderContent> {
  if (!leaderId) return EMPTY_CONTENT;

  try {
    const supabase = await createClient();

    const { data: links, error } = await supabase
      .from("content_leaders")
      .select("content_type, content_id, leader_id, role")
      .eq("leader_id", leaderId);

    if (error || !links || links.length === 0) return EMPTY_CONTENT;

    const rows = links as ContentLeader[];

    async function load<T extends { id: string }>(type: ContentType) {
      const ids = rows.filter((row) => row.content_type === type).map((row) => row.content_id);
      if (ids.length === 0) return [] as (T & { collaboration: CollaborationRole })[];

      const filter = PUBLIC_FILTER[type];
      const { data } = await supabase
        .from(CONTENT_TABLE[type])
        .select(CONTENT_FIELDS[type])
        .in("id", ids)
        .in(filter.column, filter.values);

      const roles = new Map(
        rows.filter((row) => row.content_type === type).map((row) => [row.content_id, row.role])
      );

      return ((data ?? []) as unknown as T[]).map((item) => ({
        ...item,
        collaboration: roles.get(item.id) ?? "lead",
      }));
    }

    const [programmes, opportunities, projects, events] = await Promise.all([
      load<Programme>("programme"),
      load<Opportunity>("opportunity"),
      load<Project>("project"),
      load<Event>("event"),
    ]);

    return { programmes, opportunities, projects, events };
  } catch {
    return EMPTY_CONTENT;
  }
}

/** Leaders credited on one item, lead first then partners. */
export async function getContentLeaders(
  type: ContentType,
  contentId: string
): Promise<LeaderCredit[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("content_leaders")
      .select("content_type, content_id, leader_id, role")
      .eq("content_type", type)
      .eq("content_id", contentId);

    if (error || !data || data.length === 0) return [];

    const leaders = await getLeaders();
    const byId = new Map(leaders.map((leader) => [leader.id, leader]));

    return (data as ContentLeader[])
      .map((row) => {
        const leader = byId.get(row.leader_id);
        return leader ? { leader, role: row.role } : null;
      })
      .filter((credit): credit is LeaderCredit => credit !== null)
      .sort((a, b) => (a.role === b.role ? 0 : a.role === "lead" ? -1 : 1));
  } catch {
    return [];
  }
}
