import type { Metadata } from "next";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";

import { ContentCard } from "@/components/content/content-card";
import { CtaBand } from "@/components/detail";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { formatDate, humanize } from "@/lib/format";
import { pageArt } from "@/lib/media";
import { getPublicData } from "@/lib/reach";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Scholarships, training, jobs, grants and business support opportunities for residents.",
  alternates: { canonical: "/opportunities" },
};

export default async function OpportunitiesPage() {
  const { opportunities } = await getPublicData();

  return (
    <>
      <PageHero
        eyebrow="Opportunities"
        title="Opportunities for your community"
        text="Scholarships, training, business support, jobs and internships shared on REACH by the offices and leaders serving your community."
        image={pageArt.opportunities}
        breadcrumbs={[{ label: "Opportunities", href: "/opportunities" }]}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
          <span className="size-2 rounded-full bg-gold-400" />
          {opportunities.length} active opportunit
          {opportunities.length === 1 ? "y" : "ies"}
        </p>
      </PageHero>

      <Container className="py-12 md:py-16">
        {opportunities.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity, index) => (
              <ContentCard
                key={opportunity.id}
                href={`/opportunities/${opportunity.slug}`}
                title={opportunity.title}
                summary={opportunity.summary}
                image={opportunity.image_url}
                priority={index < 3}
                fallbackIcon={<Sparkles size={28} />}
                badges={[
                  { label: humanize(opportunity.type, "Opportunity") },
                  { label: "Active", tone: "gold" },
                ]}
                meta={[
                  opportunity.location && {
                    icon: <MapPin size={14} />,
                    text: opportunity.location,
                  },
                  opportunity.deadline && {
                    icon: <CalendarDays size={14} />,
                    text: `Deadline ${formatDate(opportunity.deadline)}`,
                  },
                ].filter(Boolean) as { icon: React.ReactNode; text: string }[]}
                attribution={opportunity.attribution}
                cta="View opportunity"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles size={28} />}
            title="No opportunities published yet"
            text="New opportunities will appear here as they become available through this office."
            action={<ButtonLink href="/requests/new">Get help</ButtonLink>}
          />
        )}
      </Container>

      <CtaBand
        eyebrow="Looking for something specific?"
        title="Tell the office what you need."
        text="If you cannot find the opportunity or service you are looking for, submit a request and the appropriate office can help route you."
      >
        <ButtonLink href="/requests/new" variant="light" arrow>
          Submit a request
        </ButtonLink>
      </CtaBand>
    </>
  );
}
