import type { Jurisdiction } from "@/lib/types";

export type Operation =
  | "search"
  | "lookup"
  | "assemble"
  | "disassemble"
  | "states"
  | "lgas"
  | "districts"
  | "areas"
  | "bad-postcode";

export type RateLimitInfo = {
  limit: string | null;
  remaining: string | null;
};

export type Result = {
  operation: Operation;
  ok: boolean;
  status: number;
  upstreamStatus: number | null;
  durationMs: number;
  at: string;
  data?: Record<string, unknown>;
  error?: { code: string; message: string };
  rateLimit?: RateLimitInfo;
  source: "nipost" | "application";
};

export type FormattedPostcode = {
  canonical: string;
  dashed: string;
  display: string;
  segments: {
    state: string;
    lga: string;
    district: string;
    area: string;
    unit: string;
  };
};

export type KycVerdict = "verified" | "not_verified" | "error";

export const SAMPLE = "FC-01-A01-KP-27";
export const SEGMENTS = {
  state: "FC",
  lga: "01",
  district: "A01",
  area: "KP",
  unit: "27",
};

export const SAMPLE_BATCH = [
  "FC-01-A01-KP-27",
  "EK-01-A03-FK-01",
  "LA-01-A01-AA-01",
  "NOT-A-POSTCODE",
];

/** Canonical 2-letter NIPOST state prefix to state name for civic jurisdiction matching. */
export const NIPOST_STATE_NAMES: Record<string, string> = {
  AB: "Abia",
  AD: "Adamawa",
  AK: "Akwa Ibom",
  AN: "Anambra",
  BA: "Bauchi",
  BY: "Bayelsa",
  BE: "Benue",
  BO: "Borno",
  CR: "Cross River",
  DE: "Delta",
  EB: "Ebonyi",
  ED: "Edo",
  EK: "Ekiti",
  EN: "Enugu",
  FC: "Federal Capital Territory",
  GO: "Gombe",
  IM: "Imo",
  JI: "Jigawa",
  KD: "Kaduna",
  KN: "Kano",
  KT: "Katsina",
  KB: "Kebbi",
  KO: "Kogi",
  KW: "Kwara",
  LA: "Lagos",
  NA: "Nasarawa",
  NI: "Niger",
  OG: "Ogun",
  ON: "Ondo",
  OS: "Osun",
  OY: "Oyo",
  PL: "Plateau",
  RI: "Rivers",
  SO: "Sokoto",
  TA: "Taraba",
  YO: "Yobe",
  ZA: "Zamfara",
};

export function canonical(code: string) {
  return code.replace(/[ -]/g, "").toUpperCase();
}

export function formatPostcode(raw: string): FormattedPostcode | null {
  const clean = canonical(raw);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{3}[A-Z]{2}[0-9]{2}$/.test(clean)) {
    return null;
  }
  const state = clean.slice(0, 2);
  const lga = clean.slice(2, 4);
  const district = clean.slice(4, 7);
  const area = clean.slice(7, 9);
  const unit = clean.slice(9, 11);
  return {
    canonical: clean,
    dashed: `${state}-${lga}-${district}-${area}-${unit}`,
    display: `${state} ${lga} ${district} ${area} ${unit}`,
    segments: { state, lga, district, area, unit },
  };
}

export function nextQuery(query: string, segment: string, suggestion: string) {
  const code = canonical(suggestion);
  const index = ["state", "lga", "district", "area", "unit"].indexOf(segment);
  const starts = [0, 2, 4, 7, 9];
  const lengths = [2, 2, 3, 2, 2];
  if (index < 0) return suggestion;
  const prefix = canonical(query).slice(0, starts[index]);
  return code.length === lengths[index] ? prefix + code : code;
}

export function getKycVerdict(result: Result): KycVerdict {
  if (!result.ok) {
    if ([400, 404, 422].includes(result.upstreamStatus ?? 0)) {
      return "not_verified";
    }
    return "error";
  }
  if (
    result.data?.valid === true ||
    result.data?.status === "not_found" ||
    (result.operation === "assemble" && typeof result.data?.postcode === "string")
  ) {
    return "verified";
  }
  return "not_verified";
}

/**
 * Matches a formatted NIPOST postcode (and optional resolved area/LGA names)
 * against REACH's `jurisdictions` list so civic service requests and resident
 * sign-ups automatically select the most specific matching jurisdiction.
 */
export function matchJurisdictionFromPostcode(
  jurisdictions: Jurisdiction[],
  formatted: FormattedPostcode,
  hints?: {
    stateName?: string;
    lgaName?: string;
    districtName?: string;
    areaName?: string;
  },
): Jurisdiction | null {
  if (!jurisdictions.length) return null;

  const stateName = (
    hints?.stateName ||
    NIPOST_STATE_NAMES[formatted.segments.state] ||
    ""
  ).toLowerCase();
  const lgaName = (hints?.lgaName || "").toLowerCase();
  const areaName = (hints?.areaName || "").toLowerCase();
  const districtName = (hints?.districtName || "").toLowerCase();

  const norm = (val: string | null | undefined) => (val ?? "").trim().toLowerCase();

  // 1. Exact or partial match on ward / area name
  if (areaName) {
    const byArea = jurisdictions.find(
      (j) =>
        norm(j.name).includes(areaName) ||
        norm(j.ward).includes(areaName) ||
        norm(j.lcda).includes(areaName),
    );
    if (byArea) return byArea;
  }

  // 2. Match on district name
  if (districtName) {
    const byDistrict = jurisdictions.find(
      (j) =>
        norm(j.name).includes(districtName) ||
        norm(j.lcda).includes(districtName) ||
        norm(j.lga).includes(districtName),
    );
    if (byDistrict) return byDistrict;
  }

  // 3. Match on LGA name
  if (lgaName) {
    const byLga = jurisdictions.find(
      (j) =>
        norm(j.name).includes(lgaName) ||
        norm(j.lga).includes(lgaName) ||
        norm(j.lcda).includes(lgaName),
    );
    if (byLga) return byLga;
  }

  // 4. Match on State name (prefer constituency/lga within that state if available)
  if (stateName) {
    const inState = jurisdictions.filter(
      (j) => norm(j.state).includes(stateName) || norm(j.name).includes(stateName),
    );
    if (inState.length > 0) {
      const preferred =
        inState.find((j) => j.type === "constituency" || j.type === "lga") ??
        inState[0];
      return preferred;
    }
  }

  return null;
}
