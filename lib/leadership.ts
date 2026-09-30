import data from "@/lib/data/leaders.json";
import type { Leader, LeadershipLevel } from "@/lib/types";

/**
 * Built-in leadership profiles: federal, Lagos State and local government
 * office holders connected to Surulere.
 *
 * `lib/data/leaders.json` is the single source of truth. It is shown until the
 * `leaders` table has been migrated and seeded (supabase/seed.sql is
 * generated from the same file), and `id` is null because these rows do not
 * exist in the database.
 */
export const staticLeaders: Leader[] = data as Leader[];

export const LEADERSHIP_LEVELS: { id: LeadershipLevel; title: string; description: string }[] = [
  {
    id: "federal",
    title: "Federal Government",
    description:
      "Federal representatives and national public-service leadership connected to Surulere and Nigeria's federal government.",
  },
  {
    id: "state",
    title: "Lagos State Government",
    description:
      "Lagos State representatives serving Surulere through the Lagos State House of Assembly.",
  },
  {
    id: "local",
    title: "Local Government & LCDA",
    description:
      "Local government and LCDA leadership responsible for grassroots administration and community service delivery.",
  },
];

/** Groups leaders by level, keeping only the levels that have members. */
export function groupLeaders(leaders: Leader[]) {
  return LEADERSHIP_LEVELS.map((level) => ({
    ...level,
    members: leaders.filter((leader) => (leader.level ?? "local") === level.id),
  })).filter((group) => group.members.length > 0);
}
