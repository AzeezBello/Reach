import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import PostcodeShowcaseClient from "@/components/postcode-showcase-client";
import { ButtonLink, Container } from "@/components/ui";
import { pageArt } from "@/lib/media";

export const metadata: Metadata = {
  title: "NIPOST Digital Postcode Integration",
  description:
    "How REACH uses Nigeria's 5-segment NIPOST Digital Postcode API to pinpoint public-service requests, verify constituent residency at Level 1, and route civic infrastructure issues.",
  alternates: { canonical: "/postcode" },
};

export default function PostcodeShowcasePage() {
  return (
    <>
      <PageHero
        eyebrow="Built on Nigeria's Postcode · Public Services & Civic Infrastructure"
        title="Postcode-powered civic service delivery"
        text="REACH integrates the NIPOST Digital Postcode API so residents can pinpoint drainage, road, lighting, water, and emergency requests using a verified 5-segment national postcode—routing every issue to the responsible public office."
        image={pageArt.requests}
        breadcrumbs={[
          { label: "NIPOST Postcode Integration", href: "/postcode" },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/requests/new" size="lg" arrow>
            Submit a postcode-verified request
          </ButtonLink>
          <ButtonLink href="/login" variant="outlineLight" size="lg">
            Resident sign-up with postcode
          </ButtonLink>
        </div>
      </PageHero>

      <Container className="py-12 md:py-16">
        <PostcodeShowcaseClient />
      </Container>
    </>
  );
}
