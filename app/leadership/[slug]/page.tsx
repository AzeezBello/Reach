import Image from "next/image";
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
    description: `${person.role}. ${person.office}, ${person.jurisdiction}.`,
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
      {/* Back navigation */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Profile hero */}
          <div className="bg-slate-950 text-white">
            <div className="grid lg:grid-cols-[320px_1fr]">
              {/* Portrait */}
              <div className="relative aspect-[4/5] min-h-[360px] overflow-hidden bg-slate-900 lg:min-h-[420px]">
                {person.image ? (
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 320px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-emerald-700">
                    <span className="text-8xl font-bold">
                      {person.initial}
                    </span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/70 to-transparent lg:hidden" />
              </div>

              {/* Identity */}
              <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
                <span className="mb-4 inline-flex w-fit rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  {person.levelLabel}
                </span>

                <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                  {person.role}
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {person.name}
                </h1>

                <p className="mt-5 text-lg font-semibold text-slate-200">
                  {person.office}
                </p>

                <p className="mt-2 text-slate-400">
                  {person.jurisdiction}
                </p>

                {person.constituency && (
                  <div className="mt-7 border-t border-white/10 pt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Constituency
                    </p>

                    <p className="mt-2 font-semibold text-slate-200">
                      {person.constituency}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content */}
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
                      rel="noopener noreferrer"
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

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Level
                </p>

                <p className="mt-2 font-semibold text-slate-950">
                  {person.levelLabel}
                </p>
              </div>

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