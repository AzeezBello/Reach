import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui";
import { pageArt } from "@/lib/media";
import { PLATFORM_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The terms that apply when residents use REACH to find programmes, opportunities and events or to submit a service request to the office.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    title: "Using the service",
    body: [
      `${PLATFORM_NAME} is a free digital office that lets residents find programmes, opportunities, projects and events, and submit requests to the office that serves their area.`,
      "You must provide accurate details when you create an account or submit a request. Requests made under a false identity or on behalf of someone without their consent may be closed.",
      "Keep your sign-in details private. You are responsible for activity carried out from your account.",
    ],
  },
  {
    title: "Requests and responses",
    body: [
      "Submitting a request does not guarantee a particular outcome. The office reviews each request and responds based on its mandate and available resources.",
      "Emergencies should be reported to the relevant emergency service first. The platform is not monitored around the clock.",
      "The office may ask for more information before acting on a request and may close requests that are abusive, duplicated or outside its remit.",
    ],
  },
  {
    title: "Content and conduct",
    body: [
      "Do not upload content that is unlawful, defamatory, threatening or that infringes someone else's rights.",
      "Programme, opportunity and event listings are published in good faith. Dates, venues and eligibility can change; check the listing or the organiser's own page before travelling or applying.",
      "Leadership profiles summarise publicly available information and link to official sources. Report inaccuracies to the office so they can be corrected.",
    ],
  },
  {
    title: "Accounts",
    body: [
      "We may suspend accounts that breach these terms or that are used to disrupt the service.",
      "You can ask for your account to be closed at any time through the contact details in the footer.",
    ],
  },
  {
    title: "Changes",
    body: [
      "These terms may be updated as the service grows. The date below shows the latest revision, and continued use after a change means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of use"
        text={`The terms that apply when you use ${PLATFORM_NAME} to reach the office.`}
        image={pageArt.requests}
        breadcrumbs={[{ label: "Terms of use", href: "/terms" }]}
      />

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          <p className="text-sm text-slate-500">Last updated 6 October 2026</p>

          {SECTIONS.map((section) => (
            <section key={section.title} aria-labelledby={section.title}>
              <h2 id={section.title} className="text-2xl font-extrabold tracking-tight text-ink">
                {section.title}
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-slate-600">
                {section.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
