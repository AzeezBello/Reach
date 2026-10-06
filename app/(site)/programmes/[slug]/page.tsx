import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  MapPin,
  Users,
} from "lucide-react";

import { ContentDetailHeader } from "@/components/content/content-detail-header";
import { CtaBand, DetailBody } from "@/components/detail";
import { JsonLd } from "@/components/json-ld";
import { Badge, ButtonLink, FactRow } from "@/components/ui";
import { formatDate, formatNumber, humanize, statusTone } from "@/lib/format";
import { getProgramme, getTenant } from "@/lib/reach";
import { programmeSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const programme = await getProgramme(slug);

  if (!programme) return { title: "Programme not found" };

  return {
    title: programme.title,
    description:
      programme.summary ??
      `${programme.title}, a programme published by the digital constituency office.`,
    alternates: { canonical: `/programmes/${programme.slug}` },
    openGraph: programme.image_url
      ? { images: [{ url: programme.image_url, alt: programme.title }] }
      : undefined,
  };
}

export default async function ProgrammeDetailPage({ params }: Params) {
  const { slug } = await params;
  const [programme, { tenant, jurisdiction }] = await Promise.all([
    getProgramme(slug),
    getTenant(),
  ]);

  if (!programme) {
    notFound();
  }

  const eventSchema = programmeSchema(programme, tenant, jurisdiction);

  const facts = [
    programme.location && {
      icon: <MapPin size={18} />,
      label: "Location",
      value: programme.location,
    },
    programme.start_date && {
      icon: <CalendarDays size={18} />,
      label: "Starts",
      value: formatDate(programme.start_date, "long"),
    },
    programme.end_date && {
      icon: <CalendarDays size={18} />,
      label: "Ends",
      value: formatDate(programme.end_date, "long"),
    },
    programme.registration_deadline && {
      icon: <CalendarDays size={18} />,
      label: "Registration closes",
      value: formatDate(programme.registration_deadline, "long"),
    },
    programme.capacity && {
      icon: <Users size={18} />,
      label: "Capacity",
      value: `${formatNumber(programme.capacity)} participants`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <>
      {eventSchema && <JsonLd data={eventSchema} />}

      <ContentDetailHeader
        attribution={programme.attribution}
        breadcrumbs={[
          { label: "Programmes", href: "/programmes" },
          { label: programme.title, href: `/programmes/${programme.slug}` },
        ]}
        image={programme.image_url}
        imageAlt={programme.title}
        fallbackIcon={<ClipboardList size={34} />}
        badges={
          <>
            <Badge>{programme.category || "Programme"}</Badge>
            <Badge tone={statusTone(programme.status)}>
              {humanize(programme.status, "Open")}
            </Badge>
          </>
        }
        title={programme.title}
        summary={programme.summary}
      />

      <DetailBody
        eyebrow="About this programme"
        heading="Programme details"
        description={programme.description}
        emptyText="More information about this programme will be published soon."
        aside={
          <>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Programme information
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
                Register or ask a question
              </ButtonLink>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Submit a request and the office will follow up with the next
                steps for this programme.
              </p>
            </div>

          </>
        }
      >
      </DetailBody>

      <CtaBand
        eyebrow="Keep exploring"
        title="See what else is available in your community."
        text="Browse opportunities and community projects published through this office."
      >
        <ButtonLink href="/opportunities" variant="light">
          View opportunities
        </ButtonLink>
        <ButtonLink href="/projects" variant="outlineLight">
          View projects
        </ButtonLink>
      </CtaBand>
    </>
  );
}
