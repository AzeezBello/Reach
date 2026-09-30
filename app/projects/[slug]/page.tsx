import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Users,
  Wrench,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getPublicData } from "@/lib/reach";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Resolve the active REACH tenant first.
  const { tenant } = await getPublicData();

  const supabase = await createClient();

  // IMPORTANT:
  // Scope the project by the current tenant's organization_id.
  // A slug alone must never determine which organization's
  // project is displayed.
  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      slug,
      category,
      description,
      location,
      status,
      start_date,
      completion_date,
      beneficiary_count,
      image_url,
      created_at,
      updated_at
    `)
    .eq("organization_id", tenant.id)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !project) {
    notFound();
  }

  const statusLabel = project.status
    ? project.status.replace(/_/g, " ")
    : "Project";

  const formattedStartDate = project.start_date
    ? new Date(`${project.start_date}T00:00:00`).toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : null;

  const formattedCompletionDate = project.completion_date
    ? new Date(`${project.completion_date}T00:00:00`).toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-800"
          >
            <ArrowLeft size={16} />
            Back to projects
          </Link>

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="h-[280px] w-full object-cover md:h-[420px]"
              />
            ) : (
              <div className="flex h-[280px] items-center justify-center bg-gradient-to-br from-teal-100 via-slate-100 to-white md:h-[420px]">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-700 text-white shadow-lg">
                  <Wrench size={34} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              {project.category && (
                <span className="rounded-full bg-teal-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-teal-800">
                  {project.category}
                </span>
              )}

              <span
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider",
                  project.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : project.status === "ongoing"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-700",
                ].join(" ")}
              >
                {statusLabel}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              {project.title}
            </h1>

            {project.description && (
              <p className="mt-5 text-lg leading-8 text-slate-600 md:text-xl">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Project details */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Description */}
          <article>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">
              Project overview
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              About this project
            </h2>

            {project.description ? (
              <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700">
                {project.description}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">
                More information about this project will be published soon.
              </p>
            )}

            {project.status === "completed" && (
              <div className="mt-8 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <CheckCircle2
                  size={24}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />

                <div>
                  <h3 className="font-black text-emerald-900">
                    Project completed
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    This project has been marked as completed by the
                    organization.
                  </p>
                </div>
              </div>
            )}
          </article>

          {/* Facts */}
          <aside>
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-wider text-slate-500">
                Project information
              </p>

              <div className="mt-6 space-y-5">
                {project.location && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {project.location}
                      </p>
                    </div>
                  </div>
                )}

                {formattedStartDate && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Start date
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formattedStartDate}
                      </p>
                    </div>
                  </div>
                )}

                {formattedCompletionDate && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Completion date
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formattedCompletionDate}
                      </p>
                    </div>
                  </div>
                )}

                {project.beneficiary_count !== null &&
                  project.beneficiary_count !== undefined && (
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <Users size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Beneficiaries
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {project.beneficiary_count.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <Link
                  href="/requests/new"
                  className="flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-teal-800"
                >
                  Report an Issue
                </Link>

                <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                  Use REACH to report a problem or request assistance related
                  to a community service.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-950">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
            REACH
          </p>

          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            See what else is happening in your community.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            Explore programmes, opportunities and other community projects
            available through this civic office.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/projects"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
            >
              View projects
            </Link>

            <Link
              href="/opportunities"
              className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
            >
              View opportunities
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}