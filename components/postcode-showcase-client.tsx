"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Code2,
  Loader2,
  MapPin,
  Play,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import NipostPostcodeField, {
  type VerifiedPostcodePayload,
} from "@/components/nipost-postcode-field";
import {
  NIPOST_STATE_NAMES,
  matchJurisdictionFromPostcode,
  type Result,
} from "@/lib/postcode";
import type { Jurisdiction } from "@/lib/types";

type SuiteResult = Result & { passed: boolean };

type ServiceMatch = {
  id: string;
  office_id: string;
  organization_id: string;
  title: string;
  description: string;
  category: string;
};

const CIVIC_SCENARIOS = [
  {
    label: "Blocked drainage & flooding",
    subject: "Severe blocked drainage channel causing street flooding",
    description:
      "Stormwater drainage channel is blocked with silt and debris after heavy rainfall, causing water to back up across the residential street.",
  },
  {
    label: "Streetlight outage",
    subject: "Broken solar streetlights along residential road",
    description:
      "Four consecutive solar street lighting poles are out at night, reducing visibility and pedestrian safety for residents.",
  },
  {
    label: "Road surface repair",
    subject: "Deep potholes and damaged road section",
    description:
      "Deep potholes along the main feeder road are slowing down emergency and public transport vehicles.",
  },
  {
    label: "Public water supply",
    subject: "Community borehole and water reticulation fault",
    description:
      "Public water point pressure has dropped and requires urgent technical inspection by the utilities team.",
  },
] as const;

const SUITE_META = [
  {
    step: "01",
    title: "Postcode autocomplete",
    subtitle: "Return segment-aware suggestions for FC01A01KP",
  },
  {
    step: "02",
    title: "L1 postcode lookup",
    subtitle: "Confirm FC-01-A01-KP-27 exists at Level 1 (0 credits)",
  },
  {
    step: "03",
    title: "Assembly validation",
    subtitle: "Assemble 5 segments (FC · 01 · A01 · KP · 27) into canonical code",
  },
  {
    step: "04",
    title: "Bad-postcode handling",
    subtitle: "Send NOT-A-POSTCODE and handle real gateway rejection cleanly",
  },
] as const;

export default function PostcodeShowcaseClient() {
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [verified, setVerified] = useState<VerifiedPostcodePayload | null>(
    null,
  );
  const [matchedJurisdiction, setMatchedJurisdiction] =
    useState<Jurisdiction | null>(null);

  // Civic routing preview
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [matchingOffice, setMatchingOffice] = useState(false);
  const [matches, setMatches] = useState<ServiceMatch[]>([]);
  const [matchError, setMatchError] = useState<string | null>(null);

  // 4-check NIPOST acceptance suite
  const [runningSuite, setRunningSuite] = useState(false);
  const [suiteResults, setSuiteResults] = useState<SuiteResult[] | null>(null);
  const [suiteConfigured, setSuiteConfigured] = useState<boolean | null>(null);
  const [expandedJson, setExpandedJson] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/jurisdictions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.jurisdictions)) {
          setJurisdictions(data.jurisdictions as Jurisdiction[]);
        }
      })
      .catch(() => {});
  }, []);

  async function runCivicRoutingPreview(
    scenarioIdx = selectedScenario,
    jurisdictionOverride = matchedJurisdiction,
  ) {
    const scenario = CIVIC_SCENARIOS[scenarioIdx];
    setMatchingOffice(true);
    setMatchError(null);
    try {
      const res = await fetch("/api/service-directory/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemText: `${scenario.subject}\n${scenario.description}`,
          jurisdictionId: jurisdictionOverride?.id ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to match public office.");
      }
      setMatches(data.matches ?? []);
    } catch (err) {
      setMatchError(
        err instanceof Error ? err.message : "Could not run routing preview.",
      );
    } finally {
      setMatchingOffice(false);
    }
  }

  async function runAcceptanceSuite() {
    setRunningSuite(true);
    try {
      const res = await fetch("/api/postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "suite" }),
      });
      const data = await res.json();
      setSuiteConfigured(Boolean(data.configured));
      if (Array.isArray(data.results)) {
        setSuiteResults(data.results as SuiteResult[]);
      }
    } catch {
      setSuiteConfigured(false);
    } finally {
      setRunningSuite(false);
    }
  }

  const passedCount =
    suiteResults?.filter((item) => item.passed).length ?? 0;

  return (
    <div className="space-y-10">
      {/* Section 1: Interactive Postcode -> Civic Jurisdiction & Office Routing */}
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-800">
              <ShieldCheck size={13} />
              Step 1 · Verify NIPOST Postcode (Level 1)
            </span>
            <span className="font-mono text-xs font-semibold text-slate-400">
              NDPA 2023 Compliant · 0 Credits
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold text-ink">
            Pinpoint any street or public facility
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Verify a 5-segment NIPOST postcode (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-ink">
              State-LGA-District-Area-Unit
            </code>
            ) or assemble one from the 37-state NIPOST reference catalog. REACH
            decodes each segment and maps it to the responsible civic
            jurisdiction.
          </p>

          <div className="mt-6">
            <NipostPostcodeField
              label="Enter or build a 5-segment NIPOST Postcode"
              hint="Type FC01A01KP for live autocomplete, click Try sample (FC-01-A01-KP-27), or open Find by State & LGA."
              matchedJurisdictionName={matchedJurisdiction?.name ?? null}
              onVerified={(payload) => {
                setVerified(payload);
                if (!payload) {
                  setMatchedJurisdiction(null);
                  return;
                }
                const matched = matchJurisdictionFromPostcode(
                  jurisdictions,
                  payload.formatted,
                  payload.hints,
                );
                setMatchedJurisdiction(matched);
                runCivicRoutingPreview(selectedScenario, matched);
              }}
            />
          </div>

          {verified && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono font-bold text-emerald-400">
                  GET /v1/lookup?code={verified.postcode}&amp;level=1
                </span>
                <span className="font-mono text-slate-400">
                  HTTP {verified.rawResult.status} · {verified.durationMs} ms
                </span>
              </div>
              <pre className="mt-2.5 overflow-x-auto font-mono text-[11px] leading-5 text-slate-300">
                {JSON.stringify(
                  {
                    postcode: verified.postcode,
                    segments: verified.formatted.segments,
                    state_name:
                      NIPOST_STATE_NAMES[verified.formatted.segments.state] ??
                      verified.formatted.segments.state,
                    matched_reach_jurisdiction: matchedJurisdiction?.name ?? "Default Constituency Office",
                    nipost_response: verified.rawResult.data,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Step 2: Civic Issue Triage & Office Routing */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gold-700">
              <Building2 size={13} />
              Step 2 · Civic Service Routing (&ldquo;Who Handles This?&rdquo;)
            </span>

            <h2 className="mt-4 text-2xl font-extrabold text-ink">
              Route infrastructure &amp; utility issues by postcode
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose a sample public-service scenario below to see how REACH
              combines the verified NIPOST postcode with its service directory
              to identify the responsible office.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {CIVIC_SCENARIOS.map((item, idx) => {
                const active = selectedScenario === idx;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setSelectedScenario(idx);
                      runCivicRoutingPreview(idx, matchedJurisdiction);
                    }}
                    className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition ${
                      active
                        ? "border-brand-600 bg-brand-50 text-brand-900 ring-1 ring-brand-600"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-300"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-ink">
                {CIVIC_SCENARIOS[selectedScenario].subject}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {CIVIC_SCENARIOS[selectedScenario].description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">
                  <MapPin size={12} className="text-brand-700" />
                  Postcode:{" "}
                  <strong className="font-mono text-ink">
                    {verified?.postcode ?? "Not verified yet"}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">
                  Jurisdiction:{" "}
                  <strong className="text-ink">
                    {matchedJurisdiction?.name ?? "All / Default"}
                  </strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => runCivicRoutingPreview()}
              disabled={matchingOffice}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {matchingOffice ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Matching responsible public office...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Test &ldquo;Who Handles This?&rdquo; Routing
                </>
              )}
            </button>

            {matchError && (
              <p className="mt-3 text-xs font-semibold text-red-600">
                {matchError}
              </p>
            )}

            {matches.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Matched Responsible Offices ({matches.length})
                </p>
                {matches.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-brand-200 bg-brand-50/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-extrabold text-ink">
                        {m.title}
                      </p>
                      {m.category && (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-brand-800 ring-1 ring-brand-200">
                          {m.category}
                        </span>
                      )}
                    </div>
                    {m.description && (
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {m.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900"
            >
              Open full Civic Request Form
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold text-slate-500 hover:text-ink"
            >
              Test Resident Sign-Up Step 2 →
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2: 4-Check Live NIPOST Staging Acceptance Suite */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
              Live NIPOST API Proof · Server-Isolated Proxy (/api/postcode)
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">
              4-Check NIPOST Staging Acceptance Suite
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Executes live server-side calls against{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-ink">
                https://api.postcode.gov.ng
              </code>{" "}
              for autocomplete, Level 1 validity lookup, 5-segment assembly, and
              invalid-code rejection.
            </p>
          </div>

          <button
            type="button"
            onClick={runAcceptanceSuite}
            disabled={runningSuite}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {runningSuite ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Running 4 checks...
              </>
            ) : (
              <>
                <Play size={16} />
                Run 4-Check Live Suite
              </>
            )}
          </button>
        </div>

        {suiteConfigured === false && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900">
            Server environment variable{" "}
            <code className="font-mono font-bold">NIPOST_API_KEY</code> is not
            yet set in <code className="font-mono">.env.local</code>. Add your{" "}
            <code className="font-mono">nipost_test_*</code> key to run live
            upstream checks.
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {SUITE_META.map((meta, idx) => {
            const res = suiteResults?.[idx];
            return (
              <div
                key={meta.step}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-brand-700">
                      CHECK {meta.step}
                    </span>
                    <h3 className="mt-1 text-base font-extrabold text-ink">
                      {meta.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {meta.subtitle}
                    </p>
                  </div>

                  {res ? (
                    res.passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold uppercase text-emerald-800">
                        <CheckCircle2 size={13} />
                        Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-extrabold uppercase text-red-800">
                        <XCircle size={13} />
                        Not passed
                      </span>
                    )
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-600">
                      Ready
                    </span>
                  )}
                </div>

                {res && (
                  <div className="mt-4 border-t border-slate-200/80 pt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono">
                        Response evidence · {res.durationMs} ms · HTTP{" "}
                        {res.upstreamStatus ?? res.status}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedJson(expandedJson === idx ? null : idx)
                        }
                        className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline"
                      >
                        <Code2 size={13} />
                        {expandedJson === idx ? "Hide JSON" : "View JSON"}
                      </button>
                    </div>

                    {expandedJson === idx && (
                      <pre className="mt-2.5 max-h-48 overflow-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] leading-5 text-slate-200">
                        {JSON.stringify(res.data ?? res.error, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {suiteResults && (
          <p className="mt-4 text-xs font-bold text-slate-600">
            Summary: {passedCount} / {suiteResults.length} NIPOST acceptance
            checks passed.
          </p>
        )}
      </div>
    </div>
  );
}
