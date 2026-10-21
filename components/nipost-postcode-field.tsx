"use client";

import { useEffect, useId, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import {
  NIPOST_STATE_NAMES,
  SAMPLE,
  canonical,
  formatPostcode,
  nextQuery,
  type FormattedPostcode,
  type Result,
} from "@/lib/postcode";

type Suggestion = {
  code: string;
  name?: string;
  postcode?: string;
};

type RefItem = {
  code: string;
  name?: string;
};

export type VerifiedPostcodePayload = {
  postcode: string;
  formatted: FormattedPostcode;
  status: "verified" | "not_found";
  durationMs: number;
  hints?: {
    stateName?: string;
    lgaName?: string;
    districtName?: string;
    areaName?: string;
  };
  rawResult: Result;
};

type NipostPostcodeFieldProps = {
  label?: string;
  hint?: string;
  value?: string;
  onChange?: (code: string) => void;
  onVerified?: (payload: VerifiedPostcodePayload | null) => void;
  matchedJurisdictionName?: string | null;
  compact?: boolean;
};

export default function NipostPostcodeField({
  label = "NIPOST Digital Postcode (optional)",
  hint = "Enter your 5-segment NIPOST postcode (State-LGA-District-Area-Unit) to pinpoint the location and auto-detect the responsible civic jurisdiction.",
  value,
  onChange,
  onVerified,
  matchedJurisdictionName,
  compact = false,
}: NipostPostcodeFieldProps) {
  const inputId = useId();
  const [query, setQuery] = useState(value ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [segmentLabel, setSegmentLabel] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [verifiedPayload, setVerifiedPayload] =
    useState<VerifiedPostcodePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reference catalog ("Don't know your postcode?")
  const [builderOpen, setBuilderOpen] = useState(false);
  const [states, setStates] = useState<RefItem[]>([]);
  const [lgas, setLgas] = useState<RefItem[]>([]);
  const [districts, setDistricts] = useState<RefItem[]>([]);
  const [areas, setAreas] = useState<RefItem[]>([]);
  const [selState, setSelState] = useState("");
  const [selLga, setSelLga] = useState("");
  const [selDistrict, setSelDistrict] = useState("");
  const [selArea, setSelArea] = useState("");
  const [selUnit, setSelUnit] = useState("27");
  const [loadingRef, setLoadingRef] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function updateQuery(next: string) {
    setQuery(next);
    onChange?.(next);
  }

  // Debounced autocomplete search
  useEffect(() => {
    const trimmed = query.trim();
    const clean = canonical(trimmed);
    if (clean.length < 2 || clean.length >= 11) {
      setSuggestions([]);
      setSegmentLabel(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch("/api/postcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation: "search", query: clean }),
        });
        const data = (await res.json()) as Result;
        if (data.ok && Array.isArray(data.data?.suggestions)) {
          setSuggestions(
            (data.data.suggestions as Suggestion[]).slice(0, 8),
          );
          setSegmentLabel(
            typeof data.data.segment === "string" ? data.data.segment : null,
          );
        } else {
          setSuggestions([]);
          setSegmentLabel(null);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [query]);

  // Load states when reference builder opens
  useEffect(() => {
    if (!builderOpen || states.length > 0) return;
    let active = true;
    setLoadingRef(true);
    fetch("/api/postcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "states" }),
    })
      .then((r) => r.json())
      .then((res: Result) => {
        if (!active) return;
        if (res.ok && Array.isArray(res.data?.states)) {
          setStates(res.data.states as RefItem[]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingRef(false);
      });
    return () => {
      active = false;
    };
  }, [builderOpen, states.length]);

  async function handleSelectState(code: string) {
    setSelState(code);
    setSelLga("");
    setSelDistrict("");
    setSelArea("");
    setLgas([]);
    setDistricts([]);
    setAreas([]);
    if (!code) return;
    setLoadingRef(true);
    try {
      const r = await fetch("/api/postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "lgas", state: code }),
      });
      const res = (await r.json()) as Result;
      if (res.ok && Array.isArray(res.data?.lgas)) {
        setLgas(res.data.lgas as RefItem[]);
      }
    } finally {
      setLoadingRef(false);
    }
  }

  async function handleSelectLga(code: string) {
    setSelLga(code);
    setSelDistrict("");
    setSelArea("");
    setDistricts([]);
    setAreas([]);
    if (!selState || !code) return;
    setLoadingRef(true);
    try {
      const r = await fetch("/api/postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "districts",
          state: selState,
          lga: code,
        }),
      });
      const res = (await r.json()) as Result;
      if (res.ok && Array.isArray(res.data?.districts)) {
        setDistricts(res.data.districts as RefItem[]);
      }
    } finally {
      setLoadingRef(false);
    }
  }

  async function handleSelectDistrict(code: string) {
    setSelDistrict(code);
    setSelArea("");
    setAreas([]);
    if (!selState || !selLga || !code) return;
    setLoadingRef(true);
    try {
      const r = await fetch("/api/postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "areas",
          state: selState,
          lga: selLga,
          district: code,
        }),
      });
      const res = (await r.json()) as Result;
      if (res.ok && Array.isArray(res.data?.areas)) {
        setAreas(res.data.areas as RefItem[]);
      }
    } finally {
      setLoadingRef(false);
    }
  }

  async function verifyCode(
    rawInput?: string,
    hints?: VerifiedPostcodePayload["hints"],
  ) {
    const target = (rawInput ?? query).trim();
    if (!target) {
      setErrorMessage("Enter a NIPOST postcode (e.g. FC-01-A01-KP-27).");
      return;
    }

    setVerifying(true);
    setErrorMessage(null);
    setSuggestions([]);

    try {
      const res = await fetch("/api/postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "lookup", code: target }),
      });
      const data = (await res.json()) as Result;
      setResult(data);

      const resolvedCode =
        typeof data.data?.postcode === "string" ? data.data.postcode : target;
      const formatted = formatPostcode(resolvedCode);

      if (
        data.ok &&
        formatted &&
        (data.data?.valid === true || data.data?.status === "not_found")
      ) {
        updateQuery(formatted.dashed);
        const payload: VerifiedPostcodePayload = {
          postcode: formatted.dashed,
          formatted,
          status: data.data?.valid === true ? "verified" : "not_found",
          durationMs: data.durationMs,
          hints: {
            stateName:
              hints?.stateName ||
              NIPOST_STATE_NAMES[formatted.segments.state],
            lgaName: hints?.lgaName,
            districtName: hints?.districtName,
            areaName: hints?.areaName,
          },
          rawResult: data,
        };
        setVerifiedPayload(payload);
        onVerified?.(payload);
      } else {
        setVerifiedPayload(null);
        onVerified?.(null);
        setErrorMessage(
          data.error?.message ||
            "This postcode could not be verified at Level 1. Check the 5 segments and try again.",
        );
      }
    } catch {
      setVerifiedPayload(null);
      onVerified?.(null);
      setErrorMessage("Unable to reach the NIPOST verification gateway.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleAssembleFromBuilder() {
    if (!selState || !selLga || !selDistrict || !selArea || !selUnit) {
      setErrorMessage("Select State, LGA, District, Area, and Unit.");
      return;
    }

    setVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "assemble",
          state: selState,
          lga: selLga,
          district: selDistrict,
          area: selArea,
          unit: selUnit.padStart(2, "0"),
        }),
      });
      const data = (await res.json()) as Result;
      if (data.ok && typeof data.data?.postcode === "string") {
        const stateObj = states.find((s) => s.code === selState);
        const lgaObj = lgas.find((l) => l.code === selLga);
        const distObj = districts.find((d) => d.code === selDistrict);
        const areaObj = areas.find((a) => a.code === selArea);
        setBuilderOpen(false);
        await verifyCode(data.data.postcode, {
          stateName: stateObj?.name,
          lgaName: lgaObj?.name,
          districtName: distObj?.name,
          areaName: areaObj?.name,
        });
      } else {
        setErrorMessage(
          data.error?.message || "Could not assemble the 5 postcode segments.",
        );
      }
    } catch {
      setErrorMessage("Could not assemble postcode segments.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex items-center gap-2 text-sm font-bold text-ink"
        >
          <MapPin size={16} className="text-brand-700" />
          {label}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              updateQuery(SAMPLE);
              verifyCode(SAMPLE);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800 transition hover:bg-brand-100"
          >
            <Sparkles size={12} />
            Try sample ({SAMPLE})
          </button>

          <button
            type="button"
            onClick={() => setBuilderOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-800"
          >
            <Compass size={12} />
            {builderOpen ? "Hide builder" : "Find by State & LGA"}
            {builderOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {!compact && <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p>}

      {/* Main Postcode Input + Verify Button */}
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => {
              updateQuery(e.target.value.toUpperCase());
              setErrorMessage(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                verifyCode();
              }
            }}
            placeholder="e.g. FC-01-A01-KP-27 or LA-01-A01-AA-01"
            autoComplete="postal-code"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-sm font-bold tracking-wider text-ink uppercase outline-none focus:border-brand-600"
          />
          {searching && (
            <Loader2
              size={15}
              className=" absolute top-3 right-3 animate-spin text-slate-400"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => verifyCode()}
          disabled={verifying || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {verifying ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Verifying L1...
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Verify Postcode
            </>
          )}
        </button>
      </div>

      {/* Autocomplete Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            NIPOST Autocomplete · Next segment:{" "}
            <span className="text-brand-700">{segmentLabel ?? "unit"}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((item) => {
              const labelText = item.postcode || item.code;
              return (
                <button
                  key={labelText}
                  type="button"
                  onClick={() => {
                    const next = item.postcode
                      ? item.postcode
                      : segmentLabel
                        ? nextQuery(query, segmentLabel, item.code)
                        : item.code;
                    updateQuery(next);
                    if (canonical(next).length === 11) {
                      verifyCode(next);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-ink transition hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="font-mono font-bold text-brand-800">
                    {labelText}
                  </span>
                  {item.name && (
                    <span className="text-slate-500">· {item.name}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cascading Reference Builder ("Find by State & LGA") */}
      {builderOpen && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
              5-Segment NIPOST Reference Catalog
            </p>
            {loadingRef && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Loader2 size={12} className="animate-spin" />
                Loading NIPOST reference...
              </span>
            )}
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                1. State
              </label>
              <select
                value={selState}
                onChange={(e) => handleSelectState(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-ink"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name || NIPOST_STATE_NAMES[s.code] || s.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                2. LGA
              </label>
              <select
                value={selLga}
                onChange={(e) => handleSelectLga(e.target.value)}
                disabled={!selState}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-ink disabled:bg-slate-100"
              >
                <option value="">Select LGA</option>
                {lgas.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.code} {l.name ? `— ${l.name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                3. District
              </label>
              <select
                value={selDistrict}
                onChange={(e) => handleSelectDistrict(e.target.value)}
                disabled={!selLga}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-ink disabled:bg-slate-100"
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} {d.name ? `— ${d.name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                4. Area
              </label>
              <select
                value={selArea}
                onChange={(e) => setSelArea(e.target.value)}
                disabled={!selDistrict}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-ink disabled:bg-slate-100"
              >
                <option value="">Select Area</option>
                {areas.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} {a.name ? `— ${a.name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                5. Unit (01–99)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={2}
                  value={selUnit}
                  onChange={(e) =>
                    setSelUnit(e.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  className="w-16 rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs font-bold text-ink"
                />
                <button
                  type="button"
                  onClick={handleAssembleFromBuilder}
                  disabled={!selState || !selLga || !selDistrict || !selArea}
                  className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  Assemble
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
        >
          <XCircle size={15} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Verified L1 Postcode Summary + 5-Segment Breakdown */}
      {verifiedPayload && (
        <div className="mt-3 rounded-xl border border-brand-200 bg-white p-3.5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-800">
                <CheckCircle2 size={12} />
                {verifiedPayload.status === "verified"
                  ? "NIPOST L1 Verified"
                  : "Canonical Format · L1 Checked"}
              </span>

              <span className="font-mono text-sm font-extrabold text-ink">
                {verifiedPayload.postcode}
              </span>

              {NIPOST_STATE_NAMES[verifiedPayload.formatted.segments.state] && (
                <span className="text-xs font-semibold text-slate-600">
                  ·{" "}
                  {NIPOST_STATE_NAMES[verifiedPayload.formatted.segments.state]}
                </span>
              )}
            </div>

            <span className="font-mono text-[11px] text-slate-400">
              L1 · 0 credits · {verifiedPayload.durationMs} ms
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-5 gap-1.5 text-center">
            {(
              [
                ["State", verifiedPayload.formatted.segments.state],
                ["LGA", verifiedPayload.formatted.segments.lga],
                ["District", verifiedPayload.formatted.segments.district],
                ["Area", verifiedPayload.formatted.segments.area],
                ["Unit", verifiedPayload.formatted.segments.unit],
              ] as const
            ).map(([segName, segVal]) => (
              <div
                key={segName}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {segName}
                </p>
                <p className="mt-0.5 font-mono text-xs font-extrabold text-ink">
                  {segVal}
                </p>
              </div>
            ))}
          </div>

          {matchedJurisdictionName && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-brand-800">
              <CheckCircle2 size={13} className="text-brand-600" />
              Auto-matched REACH jurisdiction:{" "}
              <span className="font-extrabold">{matchedJurisdictionName}</span>
            </p>
          )}
        </div>
      )}

      {result && !verifiedPayload && !errorMessage && (
        <p className="mt-2 text-xs text-slate-500">
          HTTP {result.status} · {result.durationMs} ms
        </p>
      )}
    </div>
  );
}
