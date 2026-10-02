"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, MapPin, Send } from "lucide-react";

type ServiceMatch = {
  id: string;
  office_id: string;
  organization_id: string;
  title: string;
  description: string;
  category: string;
  score?: number;
};

type CreatedRequest = {
  request_id: string;
  reference_no: string;
  category: string;
  office_id: string;
  office_name: string;
  organization_id: string;
};

export default function RequestForm() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [jurisdictionId, setJurisdictionId] = useState("");

  const [matches, setMatches] = useState<ServiceMatch[]>([]);
  const [selectedMatch, setSelectedMatch] =
    useState<ServiceMatch | null>(null);

  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState<CreatedRequest | null>(null);
  const [error, setError] = useState("");

  async function findOffice() {
    setError("");
    setMatches([]);
    setSelectedMatch(null);

    if (description.trim().length < 10) {
      setError(
        "Please describe your issue in at least a few words.",
      );
      return;
    }

    setChecking(true);

    try {
      const response = await fetch(
        "/api/service-directory/match",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problemText: `${subject}\n${description}`,
            jurisdictionId: jurisdictionId || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to find an office.",
        );
      }

      setMatches(data.matches ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to find the appropriate office.",
      );
    } finally {
      setChecking(false);
    }
  }

  async function submitRequest(event: FormEvent) {
    event.preventDefault();

    setError("");
    setResult(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          description,
          jurisdictionId: jurisdictionId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit request.",
        );
      }

      setResult(data.request);

      setSubject("");
      setDescription("");
      setMatches([]);
      setSelectedMatch(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-1 h-7 w-7 text-emerald-600" />

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Request submitted
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Your request has been submitted and routed for
              review.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl bg-white p-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Reference
                </p>

                <p className="mt-1 font-mono font-bold">
                  {result.reference_no}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Assigned office
                </p>

                <p className="mt-1 font-semibold">
                  {result.office_name}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Category
                </p>

                <p className="mt-1">
                  {result.category || "General request"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Submit another request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitRequest}
      className="space-y-6"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          What do you need help with?
        </label>

        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="e.g. Blocked drainage on my street"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          Tell us more
        </label>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Describe the problem, location and any useful details..."
          rows={6}
          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          required
        />
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MapPin className="h-4 w-4" />
          Your jurisdiction
        </label>

        <input
          value={jurisdictionId}
          onChange={(event) =>
            setJurisdictionId(event.target.value)
          }
          placeholder="Jurisdiction ID"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={findOffice}
        disabled={checking}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-900 disabled:opacity-50"
      >
        {checking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Finding the right office...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            Find Who Handles This
          </>
        )}
      </button>

      {matches.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900">
            Possible service offices
          </h3>

          {matches.map((match) => {
            const selected =
              selectedMatch?.id === match.id;

            return (
              <button
                type="button"
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900">
                      {match.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {match.description}
                    </p>

                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {match.category}
                    </p>
                  </div>

                  {selected && (
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Request
          </>
        )}
      </button>
    </form>
  );
}