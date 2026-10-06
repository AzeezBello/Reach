import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Tag, ThumbsUp } from "lucide-react";

import { StatusBadge } from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SupportButton } from "@/components/support-button";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { getMySupportedRequestIds, getPublicRequest } from "@/lib/community";
import { formatDate, humanize } from "@/lib/format";
import { getCurrentUser } from "@/lib/reach";

type Params = { params: Promise<{ id: string }> };

const STEPS = ["submitted", "under_review", "in_progress", "resolved"];

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const request = await getPublicRequest(id);

  if (!request) return { title: "Request not found" };

  return {
    title: request.subject,
    description: request.description?.slice(0, 160) ?? "A request shared by a resident on REACH.",
    alternates: { canonical: `/requests/community/${id}` },
  };
}

export default async function CommunityRequestPage({ params }: Params) {
  const { id } = await params;
  const [request, user] = await Promise.all([getPublicRequest(id), getCurrentUser()]);

  if (!request) {
    notFound();
  }

  const supported = user ? await getMySupportedRequestIds() : new Set<string>();
  const status = request.status ?? "submitted";
  const stepIndex = status === "closed" ? STEPS.length - 1 : STEPS.indexOf(status);

  return (
    <div className="bg-slate-50">
      <Container className="max-w-4xl py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "Requests", href: "/requests" },
            { label: "Community", href: "/requests/community" },
            { label: request.reference_no ?? "Request", href: `/requests/community/${request.id}` },
          ]}
        />

        <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {request.reference_no && (
              <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-bold text-white">
                {request.reference_no}
              </span>
            )}
            <StatusBadge status={request.status} fallback="Submitted" />
          </div>

          <Eyebrow className="mt-5">Shared by a resident</Eyebrow>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink text-balance sm:text-3xl">
            {request.subject}
          </h1>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
            {request.jurisdiction_name && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-700" />
                {request.jurisdiction_name}
              </span>
            )}
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

          <ol className="mt-8 grid grid-cols-4 gap-2">
            {STEPS.map((step, index) => {
              const reached = index <= stepIndex;

              return (
                <li key={step}>
                  <div className={`h-1.5 rounded-full ${reached ? "bg-brand-600" : "bg-slate-200"}`} />
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
                What the resident reported
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{request.description}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-extrabold text-brand-900">
                <ThumbsUp size={16} />
                {request.support_count} resident{request.support_count === 1 ? "" : "s"} support this request
              </p>
              <p className="mt-1 text-xs leading-5 text-brand-800">
                Support shows the office how many people the issue affects. Your name is not shown publicly.
              </p>
            </div>

            <SupportButton
              id={request.id}
              count={request.support_count}
              supported={supported.has(request.id)}
              returnTo={`/requests/community/${request.id}`}
            />
          </div>
        </article>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/requests/community" variant="outline">
            All community requests
          </ButtonLink>
          <ButtonLink href="/requests/new">Raise a similar issue</ButtonLink>
        </div>
      </Container>
    </div>
  );
}
