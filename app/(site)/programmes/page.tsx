import type { Metadata } from "next";
import { CalendarDays, ClipboardList, MapPin } from "lucide-react";

import { ContentCard } from "@/components/content-card";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { formatDate } from "@/lib/format";
import { pageArt } from "@/lib/media";
import { getContentLeadersMap } from "@/lib/leaders";
import { getPublicData } from "@/lib/reach";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Education, skills, health and community programmes open to residents through the digital constituency office.",
  alternates: { canonical: "/programmes" },
};

export default async function ProgrammesPage() {
  const { programmes } = await getPublicData();
  const leaders = await getContentLeadersMap("programme", programmes.map((item) => item.id));

  return (
    <>
      <PageHero
        eyebrow="Programmes & initiatives"
        title="Programmes for residents"
        text="Education, skills, health and community programmes published on REACH by the offices and leaders serving your community."
        image={pageArt.programmes}
        breadcrumbs={[{ label: "Programmes", href: "/programmes" }]}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
          <span className="size-2 rounded-full bg-gold-400" />
          {programmes.length} programme{programmes.length === 1 ? "" : "s"} open
        </p>
      </PageHero>

      <Container className="py-12 md:py-16">
        {programmes.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme, index) => (
              <ContentCard
                key={programme.id}
                href={`/programmes/${programme.slug}`}
                title={programme.title}
                summary={programme.summary}
                image={programme.image_url}
                priority={index < 3}
                fallbackIcon={<ClipboardList size={28} />}
                badges={[{ label: programme.category || "Programme" }]}
                meta={[
                  programme.location && {
                    icon: <MapPin size={14} />,
                    text: programme.location,
                  },
                  programme.registration_deadline && {
                    icon: <CalendarDays size={14} />,
                    text: `Apply by ${formatDate(programme.registration_deadline)}`,
                  },
                ].filter(Boolean) as { icon: React.ReactNode; text: string }[]}
                leaders={leaders.get(programme.id) ?? []}
                cta="View programme"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList size={28} />}
            title="No programmes available yet"
            text="New programmes and initiatives will appear here when they are published."
            action={<ButtonLink href="/requests/new">Request assistance</ButtonLink>}
          />
        )}
      </Container>
    </>
  );
}
