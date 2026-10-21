import type {
  PriorityTier,
  ReactionCounts,
  ReactionKind,
} from "@/lib/types";

export const EMPTY_REACTIONS: ReactionCounts = {
  urgent: 0,
  affected: 0,
  safety: 0,
  resolved_check: 0,
};

export const REACTION_META: Record<
  ReactionKind,
  {
    label: string;
    shortLabel: string;
    weight: number;
    description: string;
    activeClass: string;
    dotClass: string;
  }
> = {
  urgent: {
    label: "Urgent Action",
    shortLabel: "Urgent",
    weight: 2,
    description: "Requires immediate intervention (+2 priority pts)",
    activeClass:
      "border-amber-500/80 bg-amber-950 text-amber-50 shadow-2xs",
    dotClass: "bg-amber-500",
  },
  affected: {
    label: "Affects My Street",
    shortLabel: "Affects Me",
    weight: 2,
    description: "Confirms multi-household or street-wide impact (+2 priority pts)",
    activeClass:
      "border-brand-700 bg-brand-900 text-white shadow-2xs",
    dotClass: "bg-brand-500",
  },
  safety: {
    label: "Safety Hazard",
    shortLabel: "Hazard",
    weight: 3,
    description: "Flags public safety or environmental risk (+3 priority pts)",
    activeClass:
      "border-red-600 bg-red-950 text-red-50 shadow-2xs",
    dotClass: "bg-red-500",
  },
  resolved_check: {
    label: "Field Inspection",
    shortLabel: "Inspect",
    weight: 1,
    description: "Requests on-site verification by field staff (+1 priority pt)",
    activeClass:
      "border-slate-700 bg-slate-900 text-white shadow-2xs",
    dotClass: "bg-sky-500",
  },
};

export const PRIORITY_TIER_META: Record<
  PriorityTier,
  {
    code: string;
    label: string;
    shortLabel: string;
    minScore: number;
    nextThreshold: number | null;
    badgeClass: string;
    barClass: string;
    dotClass: string;
    description: string;
  }
> = {
  watch: {
    code: "T1",
    label: "Community Watch",
    shortLabel: "Watch",
    minScore: 0,
    nextThreshold: 8,
    badgeClass:
      "border border-slate-200 bg-slate-100/90 text-slate-700",
    barClass: "bg-slate-600",
    dotClass: "bg-slate-400",
    description: "Logged on the public docket. Add support or field signals to escalate.",
  },
  rising: {
    code: "T2",
    label: "Rising Priority",
    shortLabel: "Rising",
    minScore: 8,
    nextThreshold: 20,
    badgeClass:
      "border border-amber-300/80 bg-amber-50 text-amber-900",
    barClass: "bg-amber-500",
    dotClass: "bg-amber-500",
    description: "Corroborated by multiple neighbours in this jurisdiction.",
  },
  high: {
    code: "T3",
    label: "High Civic Priority",
    shortLabel: "High Priority",
    minScore: 20,
    nextThreshold: 40,
    badgeClass:
      "border border-brand-300 bg-brand-50 text-brand-900",
    barClass: "bg-brand-600",
    dotClass: "bg-brand-600",
    description: "Escalated into the responsible office's priority dispatch queue.",
  },
  critical: {
    code: "T4",
    label: "Critical Escalation",
    shortLabel: "Critical",
    minScore: 40,
    nextThreshold: null,
    badgeClass:
      "border border-red-300 bg-red-50 text-red-900",
    barClass: "bg-red-600",
    dotClass: "bg-red-600",
    description: "Highest community escalation tier for urgent office & leadership action.",
  },
};

export function calculatePriorityScore(
  supportCount: number,
  reactions: ReactionCounts = EMPTY_REACTIONS,
  commentCount = 0,
): number {
  return (
    Math.max(0, supportCount) * 3 +
    Math.max(0, reactions.safety || 0) * 3 +
    Math.max(0, reactions.urgent || 0) * 2 +
    Math.max(0, reactions.affected || 0) * 2 +
    Math.max(0, reactions.resolved_check || 0) * 1 +
    Math.max(0, commentCount) * 2
  );
}

export function getPriorityTier(score: number): PriorityTier {
  if (score >= 40) return "critical";
  if (score >= 20) return "high";
  if (score >= 8) return "rising";
  return "watch";
}

/**
 * Extracts a verified NIPOST postcode tag (e.g. `[NIPOST Digital Postcode (L1 Verified): FC-01-A01-KP-27]`)
 * from a request description and returns the clean body text + extracted postcode.
 */
export function extractRequestPostcode(description: string | null | undefined): {
  cleanDescription: string;
  postcode: string | null;
} {
  if (!description) {
    return { cleanDescription: "", postcode: null };
  }

  const tagRegex =
    /\n*\[NIPOST(?: Digital)? Postcode[^\]]*:\s*([A-Z0-9-]+)\]/i;
  const match = description.match(tagRegex);
  if (match) {
    return {
      cleanDescription: description.replace(tagRegex, "").trim(),
      postcode: match[1].toUpperCase(),
    };
  }

  const inlineMatch = description.match(
    /\b([A-Z]{2}-[0-9]{2}-[A-Z0-9]{3}-[A-Z]{2}-[0-9]{2})\b/,
  );
  return {
    cleanDescription: description.trim(),
    postcode: inlineMatch ? inlineMatch[1].toUpperCase() : null,
  };
}
