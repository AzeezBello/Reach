import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Users,
  Wrench,
} from "lucide-react";

import { getPublicData } from "@/lib/reach";

function formatStatus(status: string | null) {
  if (!status) return "Project";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string | null) {
  if (!date) return null;

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";

    case "ongoing":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function ProjectsPage() {
  const { tenant, projects } = await getPublicData();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-teal-700">
              <Wrench size={14} />
              Community Projects
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Projects in your community
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Follow community infrastructure, environmental, public-space
              and other projects being delivered through{" "}
              <span className="font-bold text-slate-800">
                {tenant.name}
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:py-16">
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const startDate = formatDate(project.start_date);
              const completionDate = formatDate(project.completion_date);

              return (
                <article
                  key={project.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <Link
                    href={`/projects/${project.slug}`}
                    className="block overflow-hidden"
                  >
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-gradient-to-br from-teal-100 via-slate-100 to-white">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 text-white">
                          <Wrench size={28} />
                        </div>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {project.category && (
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-teal-700">
                          {project.category}
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${getStatusClasses(
                          project.status
                        )}`}
                      >
                        {formatStatus(project.status)}
                      </span>
                    </div>

                    <Link
                      href={`/projects/${project.slug}`}
                      className="block"
                    >
                      <h2 className="mt-4 text-xl font-black leading-tight text-slate-950 transition group-hover:text-teal-700">
                        {project.title}
                      </h2>
                    </Link>

                    {project.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {project.description}
                      </p>
                    )}

                    <div className="mt-5 space-y-2.5 text-xs text-slate-500">
                      {project.location && (
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={15}
                            className="shrink-0 text-teal-700"
                          />
                          <span>{project.location}</span>
                        </div>
                      )}

                      {project.beneficiary_count !== null &&
                        project.beneficiary_count !== undefined && (
                          <div className="flex items-center gap-2">
                            <Users
                              size={15}
                              className="shrink-0 text-teal-700"
                            />
                            <span>
                              {project.beneficiary_count.toLocaleString()}{" "}
                              beneficiaries
                            </span>
                          </div>
                        )}

                      {startDate && (
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="shrink-0 text-teal-700"
                          />
                          <span>
                            Started {startDate}
                            {completionDate
                              ? ` · Completion ${completionDate}`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-black text-teal-700 transition hover:text-teal-800"
                      >
                        View project
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
              <Wrench size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No projects published yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Community projects will appear here as they are published by
              the relevant office.
            </p>

            <Link
              href="/requests/new"
              className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-800"
            >
              Report a community need
            </Link>
          </div>
        )}
      </section>

      {/* Project tracking CTA */}
      <section className="border-t border-slate-100 bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-teal-300">
            <CheckCircle2 size={26} />
          </div>

          <h2 className="mt-5 text-3xl font-black text-white md:text-4xl">
            See what is happening around you
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            REACH makes community projects easier to discover and follow,
            while giving residents a direct way to report issues and request
            assistance.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
            >
              Report an issue
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/programmes"
              className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
            >
              Explore programmes
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}