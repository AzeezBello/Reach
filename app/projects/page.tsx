import { getPublicData } from "@/lib/reach";

export default async function ProjectsPage() {
  const { tenant, projects } = await getPublicData();

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <p className="text-sm font-black uppercase tracking-widest text-teal-700">
        {tenant.name}
      </p>

      <h1 className="mt-3 text-4xl font-black">
        Community Projects
      </h1>

      <p className="mt-3 text-slate-600">
        Track projects and see their current delivery status.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="text-xs font-bold uppercase text-teal-700">
              {project.status}
            </span>

            <h2 className="mt-2 text-xl font-black">
              {project.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {project.description}
            </p>

            <p className="mt-4 text-xs text-slate-500">
              {project.location || "Community project"}
            </p>

            {project.beneficiary_count && (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Beneficiaries: {project.beneficiary_count}
              </p>
            )}
          </article>
        ))}
      </div>

      {projects.length === 0 && (
        <p className="mt-10 rounded-2xl bg-slate-50 p-8 text-slate-600">
          No projects have been published yet.
        </p>
      )}
    </main>
  );
}