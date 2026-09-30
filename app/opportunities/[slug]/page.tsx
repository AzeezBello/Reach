import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getPublicData } from "@/lib/reach";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Resolve the active REACH tenant first.
  const { tenant } = await getPublicData();

  const supabase = await createClient();

  // IMPORTANT:
  // The organization_id constraint prevents a matching slug belonging
  // to another REACH organization from being displayed.
  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select(`
      id,
      title,
      slug,
      organization,
      type,
      summary,
      description,
      application_url,
      deadline,
      location,
      status,
      image_url,
      created_at,
      updated_at
    `)
    .eq("organization_id", tenant.id)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !opportunity) {
    notFound();
  }

  const formattedDeadline = opportunity.deadline
    ? new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : null;

  const opportunityType = opportunity.type
    ? opportunity.type.replace(/_/g, " ")
    : "Opportunity";

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-800"
          >
            <ArrowLeft size={16} />
            Back to opportunities
          </Link>

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {opportunity.image_url ? (
              <img
                src={opportunity.image_url}
                alt={opportunity.title}
                className="h-[280px] w-full object-cover md:h-[420px]"
              />
            ) : (
              <div className="flex h-[280px] items-center justify-center bg-gradient-to-br from-teal-100 via-slate-100 to-white md:h-[420px]">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-700 text-white shadow-lg">
                  <Sparkles size={34} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-teal-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-teal-800">
                {opportunityType}
              </span>

              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                Active
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              {opportunity.title}
            </h1>

            {opportunity.summary && (
              <p className="mt-5 text-lg leading-8 text-slate-600 md:text-xl">
                {opportunity.summary}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Main description */}
          <article>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">
              About this opportunity
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Opportunity details
            </h2>

            {opportunity.description ? (
              <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700">
                {opportunity.description}
              </div>
            ) : opportunity.summary ? (
              <p className="mt-6 text-base leading-8 text-slate-700">
                {opportunity.summary}
              </p>
            ) : (
              <p className="mt-6 text-slate-500">
                More information about this opportunity will be published
                soon.
              </p>
            )}
          </article>

          {/* Details card */}
          <aside>
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-wider text-slate-500">
                Opportunity information
              </p>

              <div className="mt-6 space-y-5">
                {opportunity.location && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Location
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {opportunity.location}
                      </p>
                    </div>
                  </div>
                )}

                {formattedDeadline && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Deadline
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formattedDeadline}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.organization && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Provided by
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {opportunity.organization}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Application CTA */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                {opportunity.application_url ? (
                  <a
                    href={opportunity.application_url}
                    target={
                      opportunity.application_url.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      opportunity.application_url.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-teal-800"
                  >
                    Apply / Get Started
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <Link
                    href="/requests/new"
                    className="flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-teal-800"
                  >
                    Request Assistance
                  </Link>
                )}

                <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                  REACH helps residents discover relevant civic opportunities
                  and services.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-100 bg-slate-950">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
            Need help?
          </p>

          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Not sure how to access this opportunity?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            Submit a request through REACH and the relevant office can help
            guide you to the appropriate service or programme.
          </p>

          <Link
            href="/requests/new"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
          >
            Get Help
          </Link>
        </div>
      </section>
    </main>
  );
}