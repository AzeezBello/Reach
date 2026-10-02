import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Users,
  Wrench,
} from "lucide-react";

import { CtaBand, DetailBody, DetailHero } from "@/components/detail";
import { LeadersPanel } from "@/components/leaders-panel";
import { Badge, ButtonLink, FactRow } from "@/components/ui";
import { getContentLeaders } from "@/lib/leaders";
import { formatDate, formatNumber, humanize, statusTone } from "@/lib/format";
import { getProject } from "@/lib/reach";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description:
      project.description?.slice(0, 160) ??
      `${project.title}, a community project tracked by the digital constituency office.`,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: project.image_url
      ? { images: [{ url: project.image_url, alt: project.title }] }
      : undefined,
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const credits = await getContentLeaders("project", project.id);

  const facts = [
    project.location && {
      icon: <MapPin size={18} />,
      label: "Location",
      value: project.location,
    },
    project.start_date && {
      icon: <CalendarDays size={18} />,
      label: "Start date",
      value: formatDate(project.start_date, "long"),
    },
    project.completion_date && {
      icon: <CalendarDays size={18} />,
      label: "Completion date",
      value: formatDate(project.completion_date, "long"),
    },
    project.beneficiary_count !== null && {
      icon: <Users size={18} />,
      label: "Beneficiaries",
      value: formatNumber(project.beneficiary_count),
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <>
      <DetailHero
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: project.title, href: `/projects/${project.slug}` },
        ]}
        image={project.image_url}
        imageAlt={project.title}
        fallbackIcon={<Wrench size={34} />}
        badges={
          <>
            {project.category && <Badge>{project.category}</Badge>}
            <Badge tone={statusTone(project.status)}>
              {humanize(project.status, "Project")}
            </Badge>
          </>
        }
        title={project.title}
      />

      <DetailBody
        eyebrow="Project overview"
        heading="About this project"
        description={project.description}
        emptyText="More information about this project will be published soon."
        aside={
          <>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Project information
            </p>

            {facts.length > 0 && (
              <div className="mt-6 space-y-5">
                {facts.map((fact) => (
                  <FactRow key={fact.label} {...fact} />
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-slate-100 pt-6">
              <ButtonLink href="/requests/new" className="w-full">
                Report an issue
              </ButtonLink>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Report a problem or request assistance related to this
                project.
              </p>
            </div>

            <LeadersPanel credits={credits} />
          </>
        }
      >
        {project.status === "completed" && (
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-brand-700" />

            <div>
              <h3 className="font-extrabold text-brand-900">Project completed</h3>
              <p className="mt-1 text-sm leading-6 text-brand-800">
                This project has been marked as completed by the office.
              </p>
            </div>
          </div>
        )}
      </DetailBody>

      <CtaBand
        eyebrow="Keep exploring"
        title="See what else is happening in your community."
        text="Explore programmes, opportunities and other community projects available through this office."
      >
        <ButtonLink href="/projects" variant="light">
          View projects
        </ButtonLink>
        <ButtonLink href="/opportunities" variant="outlineLight">
          View opportunities
        </ButtonLink>
      </CtaBand>
    </>
  );
}
