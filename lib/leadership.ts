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
      "The Presidency, the Senate and the House of Representatives: national leadership connected to Surulere and to Nigeria's federal government.",
  },
  {
    id: "state",
    title: "Lagos State Government",
    description:
      "The Governor's office and the Lagos State House of Assembly members serving Surulere.",
  },
  {
    id: "local",
    title: "Local Government & LCDA",
    description:
      "Local government and LCDA leadership responsible for grassroots administration and community service delivery.",
  },
];

/**
 * Tiers within each level, from the top of the hierarchy down. A leader is
 * placed in the first tier whose test matches their role or office text.
 */
export type Tier = {
  id: string;
  title: string;
  /** Shown under the tier title, e.g. the arm of government. */
  caption: string;
  test: (text: string) => boolean;
};

const has = (text: string, ...needles: string[]) =>
  needles.some((needle) => text.includes(needle));

export const LEVEL_TIERS: Record<LeadershipLevel, Tier[]> = {
  federal: [
    {
      id: "president",
      title: "President",
      caption: "Head of State and Government",
      test: (t) => has(t, "president") && !has(t, "vice president", "chief of staff"),
    },
    {
      id: "vice-president",
      title: "Vice President",
      caption: "Executive",
      test: (t) => has(t, "vice president"),
    },
    {
      id: "presidency",
      title: "The Presidency",
      caption: "Executive offices",
      test: (t) => has(t, "chief of staff", "office of the president", "minister"),
    },
    {
      id: "senate",
      title: "Senate",
      caption: "National Assembly · upper chamber",
      test: (t) => has(t, "senator", "senate"),
    },
    {
      id: "house",
      title: "House of Representatives",
      caption: "National Assembly · lower chamber",
      test: (t) => has(t, "house of representatives", "federal constituency", "representative"),
    },
  ],
  state: [
    {
      id: "governor",
      title: "Governor",
      caption: "Chief Executive of Lagos State",
      test: (t) => has(t, "governor") && !has(t, "deputy governor"),
    },
    {
      id: "deputy-governor",
      title: "Deputy Governor",
      caption: "Executive",
      test: (t) => has(t, "deputy governor"),
    },
    {
      id: "state-executive",
      title: "State Executive",
      caption: "Commissioners and agencies",
      test: (t) => has(t, "commissioner", "secretary to the state", "agency"),
    },
    {
      id: "assembly",
      title: "House of Assembly",
      caption: "Lagos State legislature",
      test: (t) => has(t, "house of assembly", "assembly"),
    },
  ],
  local: [
    {
      id: "chairman",
      title: "Council Chairmen",
      caption: "LGA and LCDA executive chairmen",
      test: (t) => has(t, "chairman") && !has(t, "vice chairman"),
    },
    {
      id: "vice-chairman",
      title: "Vice Chairmen",
      caption: "Council executive",
      test: (t) => has(t, "vice chairman"),
    },
    {
      id: "councillors",
      title: "Legislative Council",
      caption: "Councillors and legislative assembly",
      test: (t) => has(t, "legislative", "councillor", "council"),
    },
  ],
};

const FALLBACK_TIER: Tier = {
  id: "other",
  title: "Other office holders",
  caption: "",
  test: () => true,
};

function tierFor(level: LeadershipLevel, leader: Leader) {
  const text = `${leader.role} ${leader.office ?? ""} ${leader.level_label ?? ""}`.toLowerCase();

  return LEVEL_TIERS[level].find((tier) => tier.test(text)) ?? FALLBACK_TIER;
}

export type LeadershipTier = Tier & { members: Leader[] };

export type LeadershipGroup = (typeof LEADERSHIP_LEVELS)[number] & {
  members: Leader[];
  tiers: LeadershipTier[];
};

/**
 * Groups leaders by level and, within each level, by hierarchy tier
 * (top of the chain first). Empty levels and tiers are dropped.
 */
export function groupLeaders(leaders: Leader[]): LeadershipGroup[] {
  return LEADERSHIP_LEVELS.map((level) => {
    const members = leaders.filter((leader) => (leader.level ?? "local") === level.id);

    const tiers = [...LEVEL_TIERS[level.id], FALLBACK_TIER]
      .map((tier) => ({
        ...tier,
        members: members.filter((leader) => tierFor(level.id, leader).id === tier.id),
      }))
      .filter((tier) => tier.members.length > 0);

    return { ...level, members, tiers };
  }).filter((group) => group.members.length > 0);
}

/** The single most senior leader in a group, used for the chain overview. */
export function topOf(group: LeadershipGroup) {
  return group.tiers[0]?.members[0] ?? null;
}
