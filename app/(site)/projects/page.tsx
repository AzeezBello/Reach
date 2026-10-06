import type { Metadata } from "next";
import { CalendarDays, MapPin, Users, Wrench } from "lucide-react";

import { ContentCard } from "@/components/content-card";
import { CtaBand } from "@/components/detail";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { formatDate, formatNumber, humanize, statusTone } from "@/lib/format";
import { pageArt } from "@/lib/media";
import { getContentLeadersMap } from "@/lib/leaders";
import { getPublicData } from "@/lib/reach";

export const metadata: Metadata = {
  title: "Community projects",
  description:
    "Infrastructure, environment and public-space projects being delivered in the community.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const { projects } = await getPublicData();
  const leaders = await getContentLeadersMap("project", projects.map((item) => item.id));

  return (
    <>
      <PageHero
        eyebrow="Community projects"
        title="Projects in your community"
        text="Follow infrastructure, environmental and public-space projects being delivered across your community, and see which leaders are behind them."
        image={pageArt.projects}
        breadcrumbs={[{ label: "Projects", href: "/projects" }]}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
          <span className="size-2 rounded-full bg-gold-400" />
          {projects.length} project{projects.length === 1 ? "" : "s"} tracked
        </p>
      </PageHero>

      <Container className="py-12 md:py-16">
        {projects.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ContentCard
                key={project.id}
                href={`/projects/${project.slug}`}
                title={project.title}
                summary={project.description}
                image={project.image_url}
                priority={index < 3}
                fallbackIcon={<Wrench size={28} />}
                badges={[
                  ...(project.category ? [{ label: project.category }] : []),
                  {
                    label: humanize(project.status, "Project"),
                    tone: statusTone(project.status),
                  },
                ]}
                meta={[
                  project.location && {
                    icon: <MapPin size={14} />,
                    text: project.location,
                  },
                  project.beneficiary_count !== null && {
                    icon: <Users size={14} />,
                    text: `${formatNumber(project.beneficiary_count)} beneficiaries`,
                  },
                  project.start_date && {
                    icon: <CalendarDays size={14} />,
                    text: `Started ${formatDate(project.start_date)}`,
                  },
                ].filter(Boolean) as { icon: React.ReactNode; text: string }[]}
                cta="View project"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Wrench size={28} />}
            title="No projects published yet"
            text="Community projects will appear here as they are published by the relevant office."
            action={
              <ButtonLink href="/requests/new">Report a community need</ButtonLink>
            }
          />
        )}
      </Container>

      <CtaBand
        eyebrow="See what is happening around you"
        title="Report an issue or request assistance."
        text="REACH makes community projects easier to follow, and gives residents a direct way to report problems in their area."
      >
        <ButtonLink href="/requests/new" variant="light" arrow>
          Report an issue
        </ButtonLink>
        <ButtonLink href="/programmes" variant="outlineLight">
          Explore programmes
        </ButtonLink>
      </CtaBand>
    </>
  );
}
