import Link from "next/link";
import { getPublicData } from "@/lib/reach";

export default async function ProgrammesPage() {
  const { tenant, programmes } = await getPublicData();

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-widest text-teal-700">
          {tenant.name}
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Programmes
        </h1>

        <p className="mt-3 text-slate-600">
          Browse active programmes and initiatives available
          through this civic office.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {programmes.map((programme) => (
          <article
            key={programme.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="text-xs font-bold uppercase text-teal-700">
              {programme.category}
            </span>

            <h2 className="mt-2 text-xl font-black">
              {programme.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {programme.summary}
            </p>

            <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
              <span>
                {programme.location || "Available locally"}
              </span>

              <Link
                href={`/programmes/${programme.slug}`}
                className="font-bold text-teal-700"
              >
                View
              </Link>
            </div>
          </article>
        ))}
      </div>

      {programmes.length === 0 && (
        <p className="mt-10 rounded-2xl bg-slate-50 p-8 text-slate-600">
          No active programmes are published yet.
        </p>
      )}
    </main>
  );
}