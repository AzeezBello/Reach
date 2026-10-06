import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Globe, Lock, MessageSquareText, Tag, ThumbsUp } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import { StatusBadge } from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { getResidentRequest, requireUser } from "@/lib/admin";
import { getRequestSupportCount } from "@/lib/community";

import { setRequestVisibility } from "../community/actions";
import { formatDate, humanize } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Request details",
  robots: { index: false, follow: false },
};

const STEPS = ["submitted", "under_review", "in_progress", "resolved"];

export default async function RequestDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUser(`/requests/${id}`);
  const result = await getResidentRequest(user.id, id);

  if (!result) {
    notFound();
  }

  const { request, updates } = result;
  const supportCount = request.is_public ? await getRequestSupportCount(request.id) : 0;
  const status = request.status ?? "submitted";
  const stepIndex = status === "closed" ? STEPS.length - 1 : STEPS.indexOf(status);

  return (
    <div className="bg-slate-50">
      <Container className="max-w-4xl py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "My requests", href: "/requests" },
            { label: request.reference_no ?? "Request", href: `/requests/${request.id}` },
          ]}
        />

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {request.reference_no && (
              <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-bold text-white">
                {request.reference_no}
              </span>
            )}
            <StatusBadge status={request.status} fallback="Submitted" />
          </div>

          <Eyebrow className="mt-5">Service request</Eyebrow>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink text-balance sm:text-3xl">
            {request.subject}
          </h1>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
            {request.category && (
              <span className="inline-flex items-center gap-1.5">
                <Tag size={14} className="text-brand-700" />
                {request.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} className="text-brand-700" />
              Submitted {formatDate(request.created_at, "long")}
            </span>
            {request.updated_at && request.updated_at !== request.created_at && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-brand-700" />
                Updated {formatDate(request.updated_at, "long")}
              </span>
            )}
          </div>

          {/* Progress */}
          <ol className="mt-8 grid grid-cols-4 gap-2">
            {STEPS.map((step, index) => {
              const reached = index <= stepIndex;

              return (
                <li key={step}>
                  <div
                    className={`h-1.5 rounded-full ${
                      reached ? "bg-brand-600" : "bg-slate-200"
                    }`}
                  />
                  <p
                    className={`mt-2 text-[11px] font-bold uppercase tracking-wider ${
                      reached ? "text-brand-800" : "text-slate-400"
                    }`}
                  >
                    {humanize(step)}
                  </p>
                </li>
              );
            })}
          </ol>

          {request.description && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {request.description}
              </p>
            </div>
          )}
        </div>

        {/* Sharing */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                {request.is_public ? <Globe size={20} /> : <Lock size={20} />}
              </span>
              <div>
                <h2 className="text-base font-extrabold text-ink">
                  {request.is_public ? "Shared with the community" : "Private request"}
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                  {request.is_public
                    ? "Other residents can see the subject, description, area and status on the community requests page and add their support. Your name is never shown."
                    : "Only you and the office can see this request. Share it so residents affected by the same issue can add their support and the office can see how many people it matters to."}
                </p>
                {request.is_public && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                    <ThumbsUp size={14} />
                    {supportCount} resident{supportCount === 1 ? "" : "s"} support this request
                  </p>
                )}
              </div>
            </div>

            <ActionForm
              action={setRequestVisibility}
              inline
              variant={request.is_public ? "outline" : "primary"}
              submitLabel={request.is_public ? "Make private" : "Share with the community"}
              pendingLabel="Saving…"
            >
              <input type="hidden" name="id" value={request.id} />
              <input type="hidden" name="make_public" value={request.is_public ? "false" : "true"} />
            </ActionForm>
          </div>

          {request.is_public && (
            <ButtonLink href={`/requests/community/${request.id}`} variant="ghost" size="sm" className="mt-4">
              View the public page
            </ButtonLink>
          )}
        </section>

        {/* Timeline */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-base font-extrabold text-ink">Updates from the office</h2>

          {updates.length > 0 ? (
            <ol className="mt-5 space-y-5 border-l-2 border-brand-100 pl-5">
              {updates.map((update) => (
                <li key={update.id} className="relative">
                  <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-brand-500 ring-4 ring-white" />
                  <div className="flex flex-wrap items-center gap-2">
                    {update.status && <StatusBadge status={update.status} />}
                    <span className="text-xs text-slate-400">
                      {formatDate(update.created_at, "long")}
                    </span>
                  </div>
                  {update.message && (
                    <p className="mt-2 text-sm leading-6 text-slate-700">{update.message}</p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              <MessageSquareText size={18} className="mt-0.5 shrink-0 text-brand-700" />
              No updates yet. The office will post progress here as your request is reviewed.
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/requests" variant="outline">
            Back to my requests
          </ButtonLink>
          <ButtonLink href="/requests/new">Submit another request</ButtonLink>
        </div>
      </Container>
    </div>
  );
}
