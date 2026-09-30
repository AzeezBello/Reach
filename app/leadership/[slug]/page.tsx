import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  MapPin,
} from "lucide-react";
import { getLeader, leaders } from "@/lib/leadership";

export function generateStaticParams() {
  return leaders.map((leader) => ({
    slug: leader.slug,
  }));
}

export default async function LeadershipProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const leader = getLeader(slug);

  if (!leader) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <Link
            href="/leadership"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All leadership profiles
          </Link>

          <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-emerald-600 text-3xl font-bold">
              {leader.initial}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {leader.role}
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                {leader.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {leader.office}
                </span>

                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {leader.jurisdiction}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <article className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Profile
            </h2>

            <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-600">
              {leader.biography.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Public service
            </h2>

            <ul className="mt-4 space-y-3 text-[15px] leading-7 text-slate-600">
              {leader.service.map((item) => (
                <li
                  key={item}
                  className="border-l-2 border-emerald-200 pl-4"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Official reference sources
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              REACH uses official public sources as references. These external
              sources open in a separate tab.
            </p>

            <div className="mt-4 space-y-3">
              {leader.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  {source.label}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </article>

        <aside className="h-fit rounded-3xl bg-emerald-700 p-7 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
            REACH
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Need help with a public service?
          </h2>

          <p className="mt-3 text-sm leading-6 text-emerald-50">
            Submit a request and REACH can help route it to the appropriate
            office or service.
          </p>

          <Link
            href="/requests/new"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
          >
            Submit a request
          </Link>
        </aside>
      </section>
    </main>
  );
}