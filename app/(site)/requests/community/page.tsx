import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Megaphone, Tag, ThumbsUp } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { SupportButton } from "@/components/support-button";
import { Badge, ButtonLink, Container, EmptyState } from "@/components/ui";
import { getPublicRequests } from "@/lib/community";
import { formatDate, humanize, statusTone } from "@/lib/format";
import { pageArt } from "@/lib/media";
import { getCurrentUser } from "@/lib/reach";
import { getMySupportedRequestIds } from "@/lib/community";

export const metadata: Metadata = {
  title: "Community requests",
  description:
    "Service requests residents have shared publicly. Add your support to the issues that affect you too, so the office can see which problems matter most.",
  alternates: { canonical: "/requests/community" },
};

type Search = { category?: string; area?: string; sort?: string };

function buildHref(current: Search, patch: Partial<Search>) {
  const params = new URLSearchParams();
  const next = { ...current, ...patch };

  if (next.category) params.set("category", next.category);
  if (next.area) params.set("area", next.area);
  if (next.sort === "supported") params.set("sort", "supported");

  const query = params.toString();
  return query ? `/requests/community?${query}` : "/requests/community";
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-9 shrink-0 items-center rounded-full px-3.5 text-xs font-bold transition ${
        active ? "bg-ink text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function CommunityRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const search = await searchParams;
  const sort = search.sort === "supported" ? "supported" : "newest";

  const [user, result] = await Promise.all([
    getCurrentUser(),
    getPublicRequests({ category: search.category, jurisdiction: search.area, sort }),
  ]);

  const supported = user ? await getMySupportedRequestIds() : new Set<string>();
  const { requests, categories, areas, available } = result;
  const returnTo = buildHref(search, {});

  return (
    <>
      <PageHero
        eyebrow="Community requests"
        title="Issues residents are raising"
        text="Requests that residents chose to share. If an issue affects you too, add your support so the responsible office can see how many people it matters to."
        image={pageArt.requests}
        breadcrumbs={[
          { label: "Requests", href: "/requests" },
          { label: "Community", href: "/requests/community" },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/requests/new" size="lg" arrow>
            Raise an issue
          </ButtonLink>
          {!user && (
            <ButtonLink href="/login?next=/requests/community" variant="outlineLight" size="lg">
              Sign in to support requests
            </ButtonLink>
          )}
        </div>
      </PageHero>

      <Container className="py-10 md:py-14">
        {available && (categories.length > 0 || areas.length > 0) && (
          <div className="space-y-3">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <Chip href={buildHref(search, { sort: "newest" })} active={sort === "newest"}>
                Newest
              </Chip>
              <Chip href={buildHref(search, { sort: "supported" })} active={sort === "supported"}>
                Most supported
              </Chip>
              {categories.length > 0 && <span className="hidden w-px bg-slate-200 sm:block" aria-hidden="true" />}
              {categories.length > 0 && (
                <Chip href={buildHref(search, { category: undefined })} active={!search.category}>
                  All categories
                </Chip>
              )}
              {categories.map((category) => (
                <Chip
                  key={category}
                  href={buildHref(search, { category })}
                  active={search.category === category}
                >
                  {category}
                </Chip>
              ))}
            </div>

            {areas.length > 1 && (
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                <Chip href={buildHref(search, { area: undefined })} active={!search.area}>
                  All areas
                </Chip>
                {areas.map((area) => (
                  <Chip key={area.id} href={buildHref(search, { area: area.id })} active={search.area === area.id}>
                    {area.name}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        )}

        {!available ? (
          <EmptyState
            icon={<Megaphone size={28} />}
            title="Community requests are not available yet"
            text="This part of REACH is being set up. You can still submit a request and track it from your account."
            action={<ButtonLink href="/requests/new">Submit a request</ButtonLink>}
          />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={28} />}
            title={search.category || search.area ? "No shared requests match these filters" : "No shared requests yet"}
            text="When residents choose to share a request it appears here for others to support. Be the first: submit a request and tick “Share with the community”."
            action={<ButtonLink href="/requests/new">Raise an issue</ButtonLink>}
          />
        ) : (
          <ul className="mt-8 grid gap-5 lg:grid-cols-2">
            {requests.map((request) => (
              <li
                key={request.id}
                className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(request.status)}>{humanize(request.status, "Submitted")}</Badge>
                  {request.category && <Badge tone="slate">{request.category}</Badge>}
                  {request.reference_no && (
                    <span className="font-mono text-xs text-slate-400">{request.reference_no}</span>
                  )}
                </div>

                <h2 className="mt-3 text-lg font-extrabold leading-snug text-ink">
                  <Link
                    href={`/requests/community/${request.id}`}
                    className="after:absolute after:inset-0 after:content-[''] hover:text-brand-800"
                  >
                    {request.subject}
                  </Link>
                </h2>

                {request.description && (
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{request.description}</p>
                )}

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
                    {formatDate(request.created_at)}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <ThumbsUp size={14} className="text-brand-700" />
                    {request.support_count} resident{request.support_count === 1 ? "" : "s"} support this
                  </span>

                  <SupportButton
                    id={request.id}
                    count={request.support_count}
                    supported={supported.has(request.id)}
                    returnTo={returnTo}
                    size="sm"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
