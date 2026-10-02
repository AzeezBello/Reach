"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, MapPin, Send } from "lucide-react";

import JurisdictionSelector from "@/components/jurisdiction-selector";

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

    if (subject.trim().length < 3) {
      setError("Please enter a short subject for your request.");
      return;
    }

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
            problemText: `${subject.trim()}\n${description.trim()}`,
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

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setResult(null);

    if (subject.trim().length < 3) {
      setError("Please enter a short subject for your request.");
      return;
    }

    if (description.trim().length < 10) {
      setError(
        "Please describe your issue in at least a few words.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          jurisdictionId: jurisdictionId || null,
          serviceMatchId: selectedMatch?.id ?? null,
          officeId: selectedMatch?.office_id ?? null,
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
      setJurisdictionId("");
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

  function resetForm() {
    setResult(null);
    setError("");
    setSubject("");
    setDescription("");
    setJurisdictionId("");
    setMatches([]);
    setSelectedMatch(null);
  }

  if (result) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-emerald-600" />

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900">
              Request submitted
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your request has been submitted and routed for
              review.
            </p>

            <div className="mt-6 space-y-4 rounded-2xl bg-white p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reference
                </p>

                <p className="mt-1 font-mono font-bold text-slate-900">
                  {result.reference_no}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assigned office
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {result.office_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </p>

                <p className="mt-1 text-slate-700">
                  {result.category || "General request"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
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
        <label
          htmlFor="request-subject"
          className="mb-2 block text-sm font-semibold text-slate-900"
        >
          What do you need help with?
        </label>

        <input
          id="request-subject"
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="e.g. Blocked drainage on my street"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          required
          minLength={3}
          maxLength={200}
          disabled={submitting || checking}
        />
      </div>

      <div>
        <label
          htmlFor="request-description"
          className="mb-2 block text-sm font-semibold text-slate-900"
        >
          Tell us more
        </label>

        <textarea
          id="request-description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Describe the problem, location and any useful details..."
          rows={6}
          className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          required
          minLength={10}
          maxLength={5000}
          disabled={submitting || checking}
        />

        <p className="mt-2 text-xs text-slate-500">
          Please include the location and any details that could
          help the responsible office understand the issue.
        </p>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MapPin className="h-4 w-4" />
          Your jurisdiction
        </label>

        <JurisdictionSelector
          value={jurisdictionId}
          onChange={setJurisdictionId}
        />
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={findOffice}
          disabled={
            checking ||
            submitting ||
            subject.trim().length < 3 ||
            description.trim().length < 10
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
      </div>

      {matches.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-slate-900">
              Possible service offices
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Select the office that best matches your request.
            </p>
          </div>

          <div className="space-y-3">
            {matches.map((match) => {
              const selected =
                selectedMatch?.id === match.id;

              return (
                <button
                  type="button"
                  key={match.id}
                  onClick={() =>
                    setSelectedMatch(match)
                  }
                  disabled={submitting}
                  aria-pressed={selected}
                  className={`w-full rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${
                    selected
                      ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                      : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">
                        {match.title}
                      </p>

                      {match.description && (
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {match.description}
                        </p>
                      )}

                      {match.category && (
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {match.category}
                        </p>
                      )}
                    </div>

                    {selected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-900" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || checking}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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