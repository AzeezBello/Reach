const LOCALE = "en-NG";

/** Formats an ISO date (or date-only string) for display. */
export function formatDate(
  value: string | null | undefined,
  style: "short" | "long" = "short"
) {
  if (!value) return null;

  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

/** Formats a timestamp with the time of day, e.g. "12 Dec 2026, 9:00 am". */
export function formatDateTime(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

/** Time of day only, e.g. "9:00 am". */
export function formatTime(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

/** Turns snake_case values such as `under_review` into `Under Review`. */
export function humanize(value: string | null | undefined, fallback = "") {
  if (!value) return fallback;

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const HONORIFICS = new Set([
  "hon", "hon.", "rt", "rt.", "rt.hon.", "sen", "sen.", "senator", "dr", "dr.",
  "mr", "mr.", "mrs", "mrs.", "ms", "ms.", "chief", "prince", "princess",
  "alhaji", "alhaja", "engr", "engr.", "barr", "barr.", "prof", "prof.", "his",
  "her", "excellency", "comrade", "otunba", "oba", "pastor", "rev", "rev.",
]);

/** First letters of the first two name words, ignoring honorifics such as "Hon." */
export function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const meaningful = words.filter((word) => !HONORIFICS.has(word.toLowerCase()));

  return (meaningful.length > 0 ? meaningful : words)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export type Tone = "brand" | "gold" | "slate" | "ink";

/** Maps a content or request status to a badge tone. */
export function statusTone(status: string | null | undefined): Tone {
  switch (status) {
    case "completed":
    case "resolved":
    case "open":
    case "active":
      return "brand";

    case "ongoing":
    case "in_progress":
    case "under_review":
      return "gold";

    case "closed":
      return "ink";

    default:
      return "slate";
  }
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return null;

  return value.toLocaleString(LOCALE);
}
