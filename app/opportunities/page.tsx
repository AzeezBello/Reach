import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";

import { getPublicData } from "@/lib/reach";

function formatType(type: string | null) {
  if (!type) return "Opportunity";

  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return null;

  return new Date(`${deadline}T00:00:00`).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function OpportunitiesPage() {
  const { tenant, opportunities } = await getPublicData();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-teal-700">
              <Sparkles size={14} />
              REACH Opportunities
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Opportunities for your community
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Discover scholarships, training, business support, jobs,
              internships and other opportunities available through{" "}
              <span className="font-bold text-slate-800">
                {tenant.name}
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:py-16">
        {opportunities.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity) => {
              const deadline = formatDeadline(opportunity.deadline);

              return (
                <article
                  key={opportunity.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <Link
                    href={`/opportunities/${opportunity.slug}`}
                    className="block overflow-hidden"
                  >
                    {opportunity.image_url ? (
                      <img
                        src={opportunity.image_url}
                        alt={opportunity.title}
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-gradient-to-br from-teal-100 via-slate-100 to-white">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 text-white">
                          <Sparkles size={28} />
                        </div>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-teal-700">
                        {formatType(opportunity.type)}
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                        Active
                      </span>
                    </div>

                    <Link
                      href={`/opportunities/${opportunity.slug}`}
                      className="block"
                    >
                      <h2 className="mt-4 text-xl font-black leading-tight text-slate-950 transition group-hover:text-teal-700">
                        {opportunity.title}
                      </h2>
                    </Link>

                    {opportunity.summary && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {opportunity.summary}
                      </p>
                    )}

                    <div className="mt-5 space-y-2.5 text-xs text-slate-500">
                      {opportunity.location && (
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={15}
                            className="shrink-0 text-teal-700"
                          />
                          <span>{opportunity.location}</span>
                        </div>
                      )}

                      {deadline && (
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="shrink-0 text-teal-700"
                          />
                          <span>Deadline: {deadline}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                      <Link
                        href={`/opportunities/${opportunity.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-black text-teal-700 transition hover:text-teal-800"
                      >
                        View opportunity
                        <ArrowRight size={16} />
                      </Link>

                      {opportunity.application_url && (
                        <span
                          title="Application available"
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500"
                        >
                          <ExternalLink size={15} />
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
              <Sparkles size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No opportunities published yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              New opportunities will appear here as they become available
              through this civic office.
            </p>

            <Link
              href="/requests/new"
              className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-800"
            >
              Get Help
            </Link>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
            REACH
          </p>

          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Looking for something specific?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            If you cannot find the opportunity or service you need, submit a
            request and let the appropriate office help route you.
          </p>

          <Link
            href="/requests/new"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
          >
            Submit a request
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}