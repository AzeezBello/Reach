import type { Leader, LeadershipLevel } from "@/lib/types";

export const LEADERSHIP_LEVELS: {
  id: LeadershipLevel;
  title: string;
  description: string;
}[] = [
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

/**
 * Groups database-backed leaders by government level.
 */
export function groupLeaders(leaders: Leader[]) {
  return LEADERSHIP_LEVELS.map((level) => ({
    ...level,
    members: leaders.filter(
      (leader) => (leader.level ?? "local") === level.id
    ),
  })).filter((group) => group.members.length > 0);
}