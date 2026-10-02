import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";

import { CtaBand, DetailBody, DetailHero } from "@/components/detail";
import { LeadersPanel } from "@/components/leaders-panel";
import { Badge, ButtonLink, FactRow } from "@/components/ui";
import { getContentLeaders } from "@/lib/leaders";
import { formatDate, humanize } from "@/lib/format";
import { getOpportunity } from "@/lib/reach";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunity(slug);

  if (!opportunity) return { title: "Opportunity not found" };

  return {
    title: opportunity.title,
    description:
      opportunity.summary ??
      `${opportunity.title}, an opportunity published by the digital constituency office.`,
    alternates: { canonical: `/opportunities/${opportunity.slug}` },
    openGraph: opportunity.image_url
      ? { images: [{ url: opportunity.image_url, alt: opportunity.title }] }
      : undefined,
  };
}

export default async function OpportunityDetailPage({ params }: Params) {
  const { slug } = await params;
  const opportunity = await getOpportunity(slug);

  if (!opportunity) {
    notFound();
  }

  const credits = await getContentLeaders("opportunity", opportunity.id);

  const isExternal = Boolean(opportunity.application_url?.startsWith("http"));

  const facts = [
    opportunity.location && {
      icon: <MapPin size={18} />,
      label: "Location",
      value: opportunity.location,
    },
    opportunity.deadline && {
      icon: <CalendarDays size={18} />,
      label: "Deadline",
      value: formatDate(opportunity.deadline, "long"),
    },
    opportunity.organization && {
      icon: <Building2 size={18} />,
      label: "Provided by",
      value: opportunity.organization,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <>
      <DetailHero
        breadcrumbs={[
          { label: "Opportunities", href: "/opportunities" },
          {
            label: opportunity.title,
            href: `/opportunities/${opportunity.slug}`,
          },
        ]}
        image={opportunity.image_url}
        imageAlt={opportunity.title}
        fallbackIcon={<Sparkles size={34} />}
        badges={
          <>
            <Badge>{humanize(opportunity.type, "Opportunity")}</Badge>
            <Badge tone="gold">Active</Badge>
          </>
        }
        title={opportunity.title}
        summary={opportunity.summary}
      />

      <DetailBody
        eyebrow="About this opportunity"
        heading="Opportunity details"
        description={opportunity.description}
        emptyText="More information about this opportunity will be published soon."
        aside={
          <>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Opportunity information
            </p>

            {facts.length > 0 && (
              <div className="mt-6 space-y-5">
                {facts.map((fact) => (
                  <FactRow key={fact.label} {...fact} />
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-slate-100 pt-6">
              {opportunity.application_url ? (
                <ButtonLink
                  href={opportunity.application_url}
                  external={isExternal}
                  className="w-full"
                >
                  Apply or get started
                  <ExternalLink size={16} />
                </ButtonLink>
              ) : (
                <ButtonLink href="/requests/new" className="w-full">
                  Request assistance
                </ButtonLink>
              )}

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                {isExternal
                  ? "The application opens on the provider's website."
                  : "The office will guide you through the next steps."}
              </p>
            </div>

            <LeadersPanel credits={credits} />
          </>
        }
      />

      <CtaBand
        eyebrow="Need help?"
        title="Not sure how to access this opportunity?"
        text="Submit a request and the relevant office can help guide you to the appropriate service or programme."
      >
        <ButtonLink href="/requests/new" variant="light" arrow>
          Get help
        </ButtonLink>
        <ButtonLink href="/opportunities" variant="outlineLight">
          More opportunities
        </ButtonLink>
      </CtaBand>
    </>
  );
}
