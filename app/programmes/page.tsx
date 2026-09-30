import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  MapPin,
} from "lucide-react";

import { getPublicData } from "@/lib/reach";

export default async function ProgrammesPage() {
  const { tenant, programmes } = await getPublicData();

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">
            REACH Programmes
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Programmes & initiatives
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Discover programmes and initiatives available through{" "}
            {tenant.name}.
          </p>
        </div>

        {programmes.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => (
              <article
                key={programme.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={`/programmes/${programme.slug}`}>
                  {programme.image_url ? (
                    <img
                      src={programme.image_url}
                      alt={programme.title}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-teal-50">
                      <ClipboardList
                        size={52}
                        className="text-teal-700"
                      />
                    </div>
                  )}
                </Link>

                <div className="p-6">
                  <span className="text-xs font-black uppercase tracking-wider text-teal-700">
                    {programme.category || "Programme"}
                  </span>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    {programme.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                    {programme.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                    {programme.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {programme.location}
                      </span>
                    )}

                    {programme.registration_deadline && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        Apply by {programme.registration_deadline}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/programmes/${programme.slug}`}
                    className="mt-6 inline-flex items-center gap-2 font-black text-teal-700"
                  >
                    View programme
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <ClipboardList
              size={42}
              className="mx-auto text-teal-700"
            />

            <h2 className="mt-5 text-2xl font-black">
              No programmes available yet
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-slate-600">
              New programmes and initiatives will appear here when
              they are published.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}