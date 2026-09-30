import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { leaders } from "@/lib/leadership";

export const metadata = {
  title: "Leadership | REACH",
  description:
    "Public leadership profiles connected to the REACH civic service experience.",
};

export default function LeadershipPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Public Leadership
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Leadership profiles
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Public-service profiles, offices, jurisdictions and official
            reference sources connected to the REACH civic experience.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {leaders.map((leader) => (
            <Link
              key={leader.slug}
              href={`/leadership/${leader.slug}`}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-lg font-bold text-white">
                  {leader.initial}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    <Building2 className="h-4 w-4" />
                    {leader.office}
                  </div>

                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    {leader.name}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {leader.role}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {leader.summary}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    View profile
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}