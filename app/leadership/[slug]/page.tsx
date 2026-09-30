import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLeadershipBySlug,
  leadership,
} from "@/lib/leadership";

type LeadershipProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return leadership.map((person) => ({
    slug: person.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: LeadershipProfilePageProps) {
  const { slug } = await params;
  const person = getLeadershipBySlug(slug);

  if (!person) {
    return {
      title: "Public Official | REACH",
    };
  }

  return {
    title: `${person.name} | REACH`,
    description: `${person.office}, ${person.jurisdiction}.`,
  };
}

export default async function LeadershipProfilePage({
  params,
}: LeadershipProfilePageProps) {
  const { slug } = await params;
  const person = getLeadershipBySlug(slug);

  if (!person) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/leadership"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
          >
            <span aria-hidden="true">←</span>
            Back to Public Leadership
          </Link>
        </div>
      </section>

      {/* Profile */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Profile header */}
          <div className="border-b bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-12">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold">
                {person.initial}
              </div>

              <div>
                <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {person.levelLabel}
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {person.name}
                </h1>

                <p className="mt-2 text-lg font-semibold text-emerald-400">
                  {person.office}
                </p>

                <p className="mt-1 text-slate-300">
                  {person.jurisdiction}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_300px] lg:p-12">
            <div className="space-y-10">
              {/* Overview */}
              <section>
                <h2 className="text-xl font-bold text-slate-950">
                  Overview
                </h2>

                <p className="mt-4 text-base leading-8 text-slate-600">
                  {person.summary}
                </p>
              </section>

              {/* Biography */}
              <section>
                <h2 className="text-xl font-bold text-slate-950">
                  Biography
                </h2>

                <div className="mt-4 space-y-4">
                  {person.biography.map((paragraph, index) => (
                    <p
                      key={`${person.slug}-bio-${index}`}
                      className="leading-8 text-slate-600"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              {/* Public service */}
              <section>
                <h2 className="text-xl font-bold text-slate-950">
                  Public Service
                </h2>

                <ul className="mt-4 space-y-3">
                  {person.service.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-slate-600"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Sources */}
              <section>
                <h2 className="text-xl font-bold text-slate-950">
                  Sources & References
                </h2>

                <div className="mt-4 space-y-3">
                  {person.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <span>{source.label}</span>

                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Office
                </p>

                <p className="mt-2 font-semibold text-slate-950">
                  {person.office}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Jurisdiction
                </p>

                <p className="mt-2 font-semibold text-slate-950">
                  {person.jurisdiction}
                </p>
              </div>

              {person.constituency && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Constituency
                  </p>

                  <p className="mt-2 font-semibold text-slate-950">
                    {person.constituency}
                  </p>
                </div>
              )}

              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="font-bold text-slate-950">
                  Need civic assistance?
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Submit a request through REACH and track your request from
                  submission to resolution.
                </p>

                <Link
                  href="/requests/new"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Submit a Request
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}