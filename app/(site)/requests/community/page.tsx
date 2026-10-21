import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Clock,
  Eye,
  Flame,
  Megaphone,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { CommunityFeedCard } from "@/components/community-feed-card";
import { PageHero } from "@/components/page-hero";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import {
  type CommunitySort,
  getMySupportedRequestIds,
  getPublicRequests,
} from "@/lib/community";
import { pageArt } from "@/lib/media";
import { getCurrentUser } from "@/lib/reach";

export const metadata: Metadata = {
  title: "Community Priority Feed",
  description:
    "Public civic docket of requests shared by residents. Endorse, log field signals, and corroborate street issues so they advance in the public office dispatch queue.",
  alternates: { canonical: "/requests/community" },
};

type SearchParamsShape = {
  category?: string;
  area?: string;
  sort?: string;
  q?: string;
};

function parseSort(raw?: string): CommunitySort {
  if (
    raw === "priority" ||
    raw === "supported" ||
    raw === "discussed" ||
    raw === "newest"
  ) {
    return raw;
  }
  return "priority";
}

function buildHref(
  current: SearchParamsShape,
  patch: Partial<SearchParamsShape>,
) {
  const params = new URLSearchParams();
  const next = { ...current, ...patch };

  if (next.category) params.set("category", next.category);
  if (next.area) params.set("area", next.area);
  if (next.q) params.set("q", next.q);
  if (next.sort && next.sort !== "priority") params.set("sort", next.sort);

  const query = params.toString();
  return query ? `/requests/community?${query}` : "/requests/community";
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
        active
          ? "bg-ink text-white"
          : "border border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function CommunityRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const search = await searchParams;
  const sort = parseSort(search.sort);

  const user = await getCurrentUser();
  const [result, supported] = await Promise.all([
    getPublicRequests({
      category: search.category,
      jurisdiction: search.area,
      sort,
      q: search.q,
      userId: user?.id ?? null,
    }),
    user ? getMySupportedRequestIds() : Promise.resolve(new Set<string>()),
  ]);

  const { requests, categories, areas, stats, available } = result;
  const returnTo = buildHref(search, {});

  const topPriorityList = [...requests]
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
    .slice(0, 3);

  return (
    <div className="bg-[#FAF9F5]">
      <PageHero
        eyebrow="Public civic docket"
        title="Community Priority Feed"
        text="Every shared request is scored in real time as neighbours back it, flag safety hazards, and log street corroboration notes—helping public offices dispatch teams to the highest-impact issues first."
        image={pageArt.requests}
        breadcrumbs={[
          { label: "Requests", href: "/requests" },
          { label: "Community Feed", href: "/requests/community" },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/requests/new" size="lg" arrow>
            Report a street issue
          </ButtonLink>
          {!user ? (
            <ButtonLink
              href="/login?next=/requests/community"
              variant="outlineLight"
              size="lg"
            >
              Sign in to endorse &amp; corroborate
            </ButtonLink>
          ) : (
            <ButtonLink href="/requests" variant="outlineLight" size="lg">
              My submitted requests
            </ButtonLink>
          )}
        </div>
      </PageHero>

      <Container className="py-10 md:py-14">
        {/* Swiss-Grid Civic Telemetry Ledger */}
        {available && (
          <div className="mb-8 grid grid-cols-2 divide-y divide-slate-200/80 overflow-hidden rounded-2xl border border-slate-200/90 bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="p-4 sm:p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                01 · Active Docket
              </p>
              <p className="mt-1.5 font-mono text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">
                {stats.totalRequests}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Shared resident requests
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                02 · Civic Signals
              </p>
              <p className="mt-1.5 font-mono text-2xl font-extrabold tabular-nums text-brand-700 sm:text-3xl">
                {stats.totalSupports + stats.totalReactions}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {stats.totalSupports} endorsements · {stats.totalReactions}{" "}
                signals
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                03 · Field Notes
              </p>
              <p className="mt-1.5 font-mono text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">
                {stats.totalComments}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Street corroborations logged
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                04 · Priority Queue
              </p>
              <p className="mt-1.5 font-mono text-2xl font-extrabold tabular-nums text-amber-600 sm:text-3xl">
                {stats.highPriorityCount}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Escalated (T3 High / T4 Critical)
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Main Docket Feed Column */}
          <div className="min-w-0 space-y-5">
            {/* Integrated Search, Sort & Issue Composer Bar */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form
                  action="/requests/community"
                  method="GET"
                  className="flex flex-1 items-center gap-2"
                >
                  {search.category && (
                    <input
                      type="hidden"
                      name="category"
                      value={search.category}
                    />
                  )}
                  {search.area && (
                    <input type="hidden" name="area" value={search.area} />
                  )}
                  {search.sort && (
                    <input type="hidden" name="sort" value={search.sort} />
                  )}

                  <div className="relative flex-1">
                    <Search
                      size={14}
                      className="pointer-events-none absolute top-2.5 left-3 text-slate-400"
                    />
                    <input
                      type="search"
                      name="q"
                      defaultValue={search.q ?? ""}
                      placeholder="Filter by street, reference, category, or NIPOST postcode..."
                      aria-label="Search community requests"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-[#FAF9F5] pr-3 pl-8 text-xs font-medium text-ink placeholder:text-slate-400 focus:border-brand-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-ink transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Search
                  </button>

                  {(search.q || search.category || search.area) && (
                    <Link
                      href="/requests/community"
                      className="inline-flex h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-slate-500 hover:text-ink"
                    >
                      Clear
                    </Link>
                  )}
                </form>

                <Link
                  href="/requests/new"
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3.5 text-xs font-semibold text-white transition hover:bg-brand-800"
                >
                  <Plus size={14} />
                  <span>New Issue</span>
                </Link>
              </div>

              {/* Sort & Facet Filter Row */}
              {available && (
                <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <FilterChip
                      href={buildHref(search, { sort: "priority" })}
                      active={sort === "priority"}
                    >
                      <TrendingUp size={12} />
                      Priority Queue
                    </FilterChip>
                    <FilterChip
                      href={buildHref(search, { sort: "supported" })}
                      active={sort === "supported"}
                    >
                      <ArrowUp size={12} />
                      Most Backed
                    </FilterChip>
                    <FilterChip
                      href={buildHref(search, { sort: "discussed" })}
                      active={sort === "discussed"}
                    >
                      <MessageSquare size={12} />
                      Most Notes
                    </FilterChip>
                    <FilterChip
                      href={buildHref(search, { sort: "newest" })}
                      active={sort === "newest"}
                    >
                      <Clock size={12} />
                      Newest
                    </FilterChip>

                    {categories.length > 0 && (
                      <span
                        className="mx-1 hidden h-4 w-px bg-slate-200 sm:inline-block"
                        aria-hidden="true"
                      />
                    )}

                    {categories.length > 0 && (
                      <FilterChip
                        href={buildHref(search, { category: undefined })}
                        active={!search.category}
                      >
                        All categories
                      </FilterChip>
                    )}

                    {categories.map((category) => (
                      <FilterChip
                        key={category}
                        href={buildHref(search, { category })}
                        active={search.category === category}
                      >
                        {category}
                      </FilterChip>
                    ))}
                  </div>

                  {areas.length > 1 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <FilterChip
                        href={buildHref(search, { area: undefined })}
                        active={!search.area}
                      >
                        All areas
                      </FilterChip>
                      {areas.map((area) => (
                        <FilterChip
                          key={area.id}
                          href={buildHref(search, { area: area.id })}
                          active={search.area === area.id}
                        >
                          {area.name}
                        </FilterChip>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Docket Feed Stream */}
            {!available ? (
              <EmptyState
                icon={<Megaphone size={28} />}
                title="Community requests are not available yet"
                text="This part of REACH is being set up. You can still submit a request and track it from your account."
                action={
                  <ButtonLink href="/requests/new">Submit a request</ButtonLink>
                }
              />
            ) : requests.length === 0 ? (
              <EmptyState
                icon={<Megaphone size={28} />}
                title={
                  search.category || search.area || search.q
                    ? "No shared requests match these filters"
                    : "No shared requests on the docket yet"
                }
                text="When residents share a request it appears here for neighbours to endorse, flag hazards, and add street corroboration notes."
                action={
                  <ButtonLink href="/requests/new">Report an issue</ButtonLink>
                }
              />
            ) : (
              <div className="space-y-4">
                {requests.map((request, idx) => (
                  <CommunityFeedCard
                    key={request.id}
                    request={request}
                    supported={supported.has(request.id)}
                    isSignedIn={Boolean(user)}
                    returnTo={returnTo}
                    rank={sort === "priority" ? idx + 1 : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sticky Ledger Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {/* Priority Scoring Specification */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-700">
                Dispatch Triage Formula
              </p>

              <h2 className="mt-1.5 text-base font-bold tracking-tight text-ink">
                How requests gain priority
              </h2>

              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Community signals weight each request so offices can separate
                isolated reports from street-wide infrastructure failures:
              </p>

              <dl className="mt-4 divide-y divide-slate-100 border-y border-slate-100 text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <ArrowUp size={13} className="text-brand-700" />
                    Resident Endorsement
                  </dt>
                  <dd className="font-mono font-bold tabular-nums text-ink">
                    +3 PTS
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <AlertTriangle size={13} className="text-red-600" />
                    Safety Hazard Signal
                  </dt>
                  <dd className="font-mono font-bold tabular-nums text-ink">
                    +3 PTS
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <Flame size={13} className="text-amber-600" />
                    Urgent / Affects Street
                  </dt>
                  <dd className="font-mono font-bold tabular-nums text-ink">
                    +2 PTS
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <MessageSquare size={13} className="text-brand-700" />
                    Field Corroboration Note
                  </dt>
                  <dd className="font-mono font-bold tabular-nums text-ink">
                    +2 PTS
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <Eye size={13} className="text-slate-500" />
                    Field Inspection Request
                  </dt>
                  <dd className="font-mono font-bold tabular-nums text-ink">
                    +1 PT
                  </dd>
                </div>
              </dl>

              <div className="mt-3.5 grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <div className="rounded border border-slate-200/80 bg-[#FAF9F5] px-2 py-1.5">
                  <span className="font-bold text-ink">T2 RISING</span>
                  <span className="block text-slate-500">8–19 PTS</span>
                </div>
                <div className="rounded border border-slate-200/80 bg-[#FAF9F5] px-2 py-1.5">
                  <span className="font-bold text-brand-800">T3 HIGH</span>
                  <span className="block text-slate-500">20–39 PTS</span>
                </div>
                <div className="col-span-2 rounded border border-red-200/80 bg-red-50/50 px-2 py-1.5">
                  <span className="font-bold text-red-900">
                    T4 CRITICAL ESCALATION
                  </span>
                  <span className="ml-2 text-red-700">40+ PTS</span>
                </div>
              </div>
            </div>

            {/* Top Priority Queue Leaderboard */}
            {topPriorityList.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Highest Ranked Issues
                </p>

                <ol className="mt-3 divide-y divide-slate-100">
                  {topPriorityList.map((item, index) => (
                    <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                        <span className="font-bold text-brand-700">
                          #{String(index + 1).padStart(2, "0")} ·{" "}
                          {item.jurisdiction_name || "General"}
                        </span>
                        <span className="font-bold tabular-nums text-ink">
                          {item.priority_score ?? 0} PTS
                        </span>
                      </div>
                      <Link
                        href={`/requests/community/${item.id}`}
                        className="mt-1 block line-clamp-2 text-xs font-semibold leading-snug text-ink transition hover:text-brand-700"
                      >
                        {item.subject}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* NIPOST Addressing Standard Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-[#F3F1EC] p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-800">
                <ShieldCheck size={14} />
                NIPOST L1 Addressing
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                Verify a 5-segment NIPOST postcode when submitting or
                corroborating a request so field engineers can locate the exact
                street unit.
              </p>
              <Link
                href="/postcode"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-brand-800"
              >
                Open Postcode Locator
                <ArrowRight size={13} />
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
