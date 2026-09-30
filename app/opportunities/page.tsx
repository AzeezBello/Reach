import { getPublicData } from "@/lib/reach";

export default async function OpportunitiesPage() {
  const { tenant, opportunities } = await getPublicData();

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <p className="text-sm font-black uppercase tracking-widest text-teal-700">
        {tenant.name}
      </p>

      <h1 className="mt-3 text-4xl font-black">
        Opportunities
      </h1>

      <p className="mt-3 text-slate-600">
        Scholarships, jobs, training, grants and other
        opportunities published by the office.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opportunity) => (
          <article
            key={opportunity.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="text-xs font-bold uppercase text-teal-700">
              {opportunity.type}
            </span>

            <h2 className="mt-2 text-xl font-black">
              {opportunity.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {opportunity.summary}
            </p>

            {opportunity.deadline && (
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Deadline: {opportunity.deadline}
              </p>
            )}

            {opportunity.application_url && (
              <a
                href={opportunity.application_url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white"
              >
                Apply
              </a>
            )}
          </article>
        ))}
      </div>

      {opportunities.length === 0 && (
        <p className="mt-10 rounded-2xl bg-slate-50 p-8 text-slate-600">
          No open opportunities are published yet.
        </p>
      )}
    </main>
  );
}