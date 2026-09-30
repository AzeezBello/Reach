"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, LogIn } from "lucide-react";

import { buttonClasses } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Roads",
  "Drainage",
  "Street Lighting",
  "Water",
  "Waste Management",
  "Education",
  "Healthcare",
  "Employment",
  "Business",
  "Welfare",
  "Documentation",
  "Other",
];

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; reference: string | null };

export function RequestForm({
  tenantId,
  jurisdictionId,
  userId,
}: {
  tenantId: string;
  jurisdictionId: string | null;
  userId: string | null;
}) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setStatus({
        kind: "error",
        message: "Please sign in before submitting a request.",
      });
      return;
    }

    setStatus({ kind: "submitting" });

    const supabase = createClient();

    const { data, error } = await supabase
      .from("requests")
      .insert({
        resident_id: userId,
        organization_id: tenantId,
        jurisdiction_id: jurisdictionId,
        category,
        subject: subject.trim(),
        description: description.trim(),
      })
      .select("reference_no")
      .maybeSingle();

    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }

    setSubject("");
    setDescription("");
    setStatus({ kind: "success", reference: data?.reference_no ?? null });
  }

  if (status.kind === "success") {
    return (
      <div className="rounded-3xl border border-brand-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <CheckCircle2 size={26} />
        </span>

        <h2 className="mt-5 text-2xl font-extrabold text-ink">
          Your request has been submitted
        </h2>

        {status.reference ? (
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Keep this reference number for follow-up:{" "}
            <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-bold text-white">
              {status.reference}
            </span>
          </p>
        ) : (
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The office has received your request. You can follow its progress
            from your requests page.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className={buttonClasses("primary")}>
            Go to my dashboard
          </Link>
          <button
            type="button"
            onClick={() => setStatus({ kind: "idle" })}
            className={buttonClasses("outline")}
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {!userId && (
        <div className="flex flex-col gap-4 rounded-2xl border border-gold-200 bg-gold-100/60 p-4 text-sm leading-6 text-gold-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <LogIn size={18} className="mt-0.5 shrink-0" />
            You need a resident account to submit a request, so the office can
            follow up with you.
          </p>

          <Link
            href="/login?next=/requests/new"
            className={buttonClasses("dark", "sm", "shrink-0")}
          >
            Sign in or create account
          </Link>
        </div>
      )}

      <div>
        <label htmlFor="category" className="mb-2 block text-sm font-bold text-ink">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={inputClasses}
        >
          {CATEGORIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-bold text-ink">
          Subject
        </label>
        <input
          id="subject"
          required
          maxLength={120}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Briefly describe the issue"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-bold text-ink">
          Description
        </label>
        <textarea
          id="description"
          required
          rows={6}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Where is it, how long has it been happening, and who is affected?"
          className={inputClasses}
        />
        <p className="mt-2 text-xs text-slate-500">
          Include a street or landmark so the office can locate the issue.
        </p>
      </div>

      {status.kind === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.kind === "submitting" || !userId}
        className={buttonClasses("primary", "lg", "w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto")}
      >
        {status.kind === "submitting" ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
