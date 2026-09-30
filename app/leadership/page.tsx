import Image from "next/image";
import Link from "next/link";
import { leadershipGroups } from "@/lib/leadership";

export const metadata = {
  title: "Public Leadership | REACH",
  description:
    "Public leadership directory for representatives and public officials serving the Surulere community.",
};

function LeadershipCard({
  person,
}: {
  person: (typeof leadershipGroups)[number]["members"][number];
}) {
  return (
    <Link
      href={`/leadership/${person.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {person.image ? (
          <Image
            src={person.image}
            alt={person.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50">
            <span className="text-5xl font-bold text-emerald-700">
              {person.initial}
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
            {person.levelLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          {person.role}
        </p>

        <h3 className="mt-2 text-xl font-bold text-slate-950 transition group-hover:text-emerald-700">
          {person.name}
        </h3>

        <p className="mt-2 text-sm font-semibold text-slate-600">
          {person.office}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {person.jurisdiction}
        </p>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {person.summary}
        </p>

        <div className="mt-auto pt-6">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
            View profile
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LeadershipPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              Public Leadership Directory
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Public leadership serving Surulere
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Find representatives and public officials across federal, Lagos
              State, and local government levels.
            </p>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="space-y-16">
          {leadershipGroups.map((group) => (
            <section key={group.id}>
              <div className="mb-7 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-emerald-600" />

                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    {group.title}
                  </h2>
                </div>

                <p className="mt-3 text-slate-600">
                  {group.description}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {group.members.map((person) => (
                  <LeadershipCard
                    key={person.slug}
                    person={person}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-emerald-700 p-8 text-white md:flex-row md:items-center lg:p-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold">
                Need help with a community issue?
              </h2>

              <p className="mt-2 leading-7 text-emerald-50">
                Submit a request through REACH and track its progress through
                your digital civic office.
              </p>
            </div>

            <Link
              href="/requests/new"
              className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              Get Help
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}